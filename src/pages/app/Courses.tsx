import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Loader2, TriangleAlert, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type ApiCourse } from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { CourseDropzone } from "@/components/courses/CourseDropzone";
import { QrCourseImportButton } from "@/components/courses/QrCourseImport";

const STATUS_META: Record<ApiCourse["status"], { label: string; icon: typeof Clock; className: string }> = {
  uploaded: { label: "En attente", icon: Clock, className: "text-text-secondary" },
  processing: { label: "Analyse en cours…", icon: Loader2, className: "text-purple" },
  completed: { label: "Fiche prête", icon: FileText, className: "text-purple" },
  failed: { label: "Échec", icon: TriangleAlert, className: "text-red-500" },
};

export default function Courses() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<ApiCourse[] | null>(null);
  const [sheetByCourse, setSheetByCourse] = useState<Record<string, string>>({});
  const [retryingId, setRetryingId] = useState<string | null>(null);

  function refresh() {
    api.listCourses(token!).then(({ courses }) => setCourses(courses));
    api.listSheets(token!).then(({ sheets }) => {
      const map: Record<string, string> = {};
      for (const sheet of sheets) map[sheet.courseId] = sheet.id;
      setSheetByCourse(map);
    });
  }

  useEffect(refresh, [token]);

  async function retry(courseId: string) {
    setRetryingId(courseId);
    try {
      await api.generateSheet(token!, courseId);
    } catch {
      // l'erreur est déjà stockée sur le cours et affichée via son statut
    } finally {
      setRetryingId(null);
      refresh();
    }
  }

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold text-text sm:text-[30px]">Tes cours</h1>

      <div className="mt-6">
        <CourseDropzone onUploaded={refresh} />
      </div>

      <div className="mt-4 flex justify-center">
        <QrCourseImportButton onImported={refresh} />
      </div>

      <div className="mt-8">
        {courses === null ? (
          <p className="text-[15px] text-text-secondary">Chargement…</p>
        ) : courses.length === 0 ? (
          <EmptyState title="Aucun cours pour l'instant" description="Importe ton premier cours ci-dessus." />
        ) : (
          <div className="flex flex-col gap-3">
            {courses.map((course) => {
              const meta = STATUS_META[course.status];
              const sheetId = sheetByCourse[course.id];
              return (
                <div
                  key={course.id}
                  className="flex items-center justify-between rounded-[14px] border border-border/60 bg-white px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-text">{course.title}</p>
                    {course.filename && (
                      <p className="mt-0.5 truncate text-[13px] text-text-secondary">{course.filename}</p>
                    )}
                    {course.photoCount > 1 && (
                      <p className="mt-0.5 truncate text-[13px] text-text-secondary">
                        {course.photoCount} photos
                      </p>
                    )}
                    {course.status === "failed" && course.errorMessage && (
                      <p className="mt-0.5 truncate text-[12px] text-red-500">{course.errorMessage}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className={`flex items-center gap-1.5 text-[13px] font-medium ${meta.className}`}>
                      <meta.icon className={`h-4 w-4 ${course.status === "processing" ? "animate-spin" : ""}`} />
                      {meta.label}
                    </span>
                    {course.status === "completed" && sheetId && (
                      <Link
                        to={`/app/sheets/${sheetId}`}
                        className="rounded-full bg-purple/[0.09] px-4 py-2 text-[14px] font-semibold text-purple transition-colors hover:bg-purple/[0.15]"
                      >
                        Voir la fiche
                      </Link>
                    )}
                    {(course.status === "failed" || course.status === "uploaded") && (
                      <button
                        type="button"
                        onClick={() => retry(course.id)}
                        disabled={retryingId === course.id}
                        className="rounded-full bg-purple/[0.09] px-4 py-2 text-[14px] font-semibold text-purple transition-colors hover:bg-purple/[0.15] disabled:opacity-60"
                      >
                        {retryingId === course.id ? "Génération…" : "Générer la fiche"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
