// Si VITE_API_URL n'est pas fourni, on déduit l'hôte du backend depuis celui de la page.
// Indispensable pour le flux QR code : quand le téléphone charge le front via l'IP locale du PC
// (ex: http://10.0.0.8:5220), il doit taper l'API sur cette même IP, pas sur "localhost" (qui,
// depuis le téléphone, désignerait le téléphone lui-même).
const API_URL = import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:4010`;

export type Level = "3e" | "seconde" | "premiere" | "terminale" | "superieur";
export type Theme = "light" | "dark" | "auto";
export type CourseStatus = "uploaded" | "processing" | "completed" | "failed";

export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  level: Level | null;
  theme: Theme;
  onboardingCompleted: boolean;
  emailVerified: boolean;
  isPremium: boolean;
  createdAt: string;
}

export interface ApiSubject {
  id: string;
  name: string;
  isCustom: boolean;
}

export interface ApiCourse {
  id: string;
  title: string;
  filename: string | null;
  subjectId: string | null;
  chapter: string | null;
  status: CourseStatus;
  errorMessage: string | null;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSheetSummary {
  id: string;
  courseId: string;
  title: string;
  summary: string;
  courseTitle: string;
  subjectId: string | null;
  subjectName: string | null;
  chapter: string | null;
  // Compte gratuit : le contenu est masqué côté serveur.
  locked: boolean;
  createdAt: string;
}

export interface ApiSheetSection {
  id: string;
  type: string;
  title: string | null;
  content: string;
}

export interface ApiSheetDetail extends ApiSheetSummary {
  sections: ApiSheetSection[];
}



export type UploadSessionStatus = "pending" | "received" | "consumed" | "expired";

export interface ApiSessionPhoto {
  id: string;
  position: number;
  mimeType: string;
  createdAt: string;
}

export interface ApiSubjectSuggestion {
  id: string;
  name: string;
}

export interface SheetUpdate {
  title: string;
  summary: string;
  sections: { type: string; title: string | null; content: string }[];
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error ?? "Une erreur est survenue.", res.status);
  }

  return data as T;
}

async function requestBlob(path: string, token: string): Promise<Blob> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new ApiError("Impossible de charger cette photo.", res.status);
  }
  return res.blob();
}

export const api = {
  register: (email: string, password: string, firstName: string) =>
    request<{ token: string; user: ApiUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, firstName }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: ApiUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email: string) =>
    request<{ ok: true }>("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string) =>
    request<{ ok: true }>("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) }),

  verifyEmail: (token: string) =>
    request<{ ok: true }>("/api/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) }),

  sendVerification: (token: string) =>
    request<{ ok: true; alreadyVerified?: boolean }>("/api/auth/send-verification", { method: "POST" }, token),

  googleLogin: (accessToken: string) =>
    request<{ token: string; user: ApiUser; isNew: boolean }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ accessToken }),
    }),

  me: (token: string) => request<{ user: ApiUser }>("/api/me", {}, token),

  deleteAccount: (token: string, confirm: string) =>
    request<void>("/api/me", { method: "DELETE", body: JSON.stringify({ confirm }) }, token),

  listSubjects: (token: string) => request<{ subjects: ApiSubject[] }>("/api/subjects", {}, token),

  createSubject: (token: string, name: string) =>
    request<{ subject: ApiSubject }>(
      "/api/subjects",
      { method: "POST", body: JSON.stringify({ name }) },
      token,
    ),

  submitOnboarding: (token: string, payload: { level: Level; subjectIds: string[]; theme: Theme }) =>
    request<{ user: ApiUser }>(
      "/api/onboarding",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),

  createParentLink: (token: string) =>
    request<{ url: string }>("/api/billing/parent-link", { method: "POST" }, token),

  getParentInvite: (parentToken: string) =>
    request<{ firstName: string }>(`/api/billing/parent/${encodeURIComponent(parentToken)}`),

  updateProfile: (token: string, payload: { firstName?: string; level?: Level; subjectIds?: string[] }) =>
    request<{ user: ApiUser }>("/api/me", { method: "PATCH", body: JSON.stringify(payload) }, token),

  getMySubjectIds: (token: string) => request<{ subjectIds: string[] }>("/api/onboarding/subjects", {}, token),

  listCourses: (token: string) => request<{ courses: ApiCourse[] }>("/api/courses", {}, token),

  uploadCourse: (token: string, file: File, opts?: { subjectId?: string; chapter?: string }) => {
    const form = new FormData();
    form.append("file", file);
    if (opts?.subjectId) form.append("subjectId", opts.subjectId);
    if (opts?.chapter) form.append("chapter", opts.chapter);
    return request<{ course: ApiCourse }>("/api/courses", { method: "POST", body: form }, token);
  },

  getCourse: (token: string, id: string) => request<{ course: ApiCourse }>(`/api/courses/${id}`, {}, token),

  deleteCourse: (token: string, id: string) =>
    request<void>(`/api/courses/${id}`, { method: "DELETE" }, token),

  generateSheet: (token: string, courseId: string) =>
    request<{ sheetId: string; suggestedSubject: ApiSubjectSuggestion | null }>(
      `/api/courses/${courseId}/generate`,
      { method: "POST" },
      token,
    ),

  updateSheet: (token: string, id: string, update: SheetUpdate) =>
    request<{ sheet: ApiSheetDetail }>(`/api/sheets/${id}`, { method: "PUT", body: JSON.stringify(update) }, token),

  setSheetSubject: (token: string, id: string, subjectId: string | null) =>
    request<{ sheet: ApiSheetDetail }>(
      `/api/sheets/${id}/subject`,
      { method: "PATCH", body: JSON.stringify({ subjectId }) },
      token,
    ),

  listSheets: (token: string) => request<{ sheets: ApiSheetSummary[] }>("/api/sheets", {}, token),

  getSheet: (token: string, id: string) => request<{ sheet: ApiSheetDetail }>(`/api/sheets/${id}`, {}, token),

  createUploadSession: (token: string) =>
    request<{ sessionId: string; expiresAt: string; lanIp: string | null }>(
      "/api/upload-sessions",
      { method: "POST" },
      token,
    ),

  getUploadSessionStatus: (sessionId: string) =>
    request<{ status: UploadSessionStatus; photoCount: number }>(`/api/upload-sessions/${sessionId}/status`),

  uploadSessionPhoto: (sessionId: string, photo: File) => {
    const form = new FormData();
    form.append("photo", photo);
    return request<{ ok: true; photoCount: number }>(
      `/api/upload-sessions/${sessionId}/photo`,
      { method: "POST", body: form },
    );
  },

  listUploadSessionPhotos: (token: string, sessionId: string) =>
    request<{ photos: ApiSessionPhoto[] }>(`/api/upload-sessions/${sessionId}/photos`, {}, token),

  getUploadSessionPhotoBlob: (token: string, sessionId: string, photoId: string) =>
    requestBlob(`/api/upload-sessions/${sessionId}/photos/${photoId}/file`, token),

  resetUploadSession: (token: string, sessionId: string) =>
    request<{ ok: true }>(`/api/upload-sessions/${sessionId}/reset`, { method: "POST" }, token),

  importUploadSession: (token: string, sessionId: string) =>
    request<{ course: ApiCourse }>(`/api/upload-sessions/${sessionId}/import`, { method: "POST" }, token),
};
