// Connexion Google via Google Identity Services (fenêtre de connexion officielle de Google).
// L'ID client est public : il se crée dans la console Google Cloud (voir .env.example).
export const GOOGLE_CLIENT_ID: string | undefined = import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined;

interface TokenResponse {
  access_token?: string;
  error?: string;
}

interface TokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: { type: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

// Le script Google n'est chargé que sur les pages de connexion / inscription, et seulement si la
// connexion Google est configurée : aucun autre visiteur ne contacte Google.
export function loadGoogleScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("script_failed"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export class GoogleCancelledError extends Error {}

// À appeler directement depuis un clic (sinon le navigateur bloque la fenêtre de connexion).
export function requestGoogleAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const google = window.google;
    if (!google || !GOOGLE_CLIENT_ID) {
      reject(new Error("unavailable"));
      return;
    }
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "openid email profile",
      callback: (response) => {
        if (response.access_token) resolve(response.access_token);
        else reject(new GoogleCancelledError(response.error ?? "denied"));
      },
      error_callback: (error) => {
        reject(error.type === "popup_closed" ? new GoogleCancelledError("popup_closed") : new Error(error.type));
      },
    });
    client.requestAccessToken({ prompt: "select_account" });
  });
}
