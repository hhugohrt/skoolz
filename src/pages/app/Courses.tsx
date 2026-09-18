import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FolderOpen, Loader2, TriangleAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type ApiCourse, type ApiSheetSummary, type ApiSubject } from "@/lib/api";

interface Folder {
  key: string;
  name: string;
  sheets: ApiSheetSummary[];
}

function FolderCard({ folder }: { folder: Folder }) {
  const count = folder.sheets.length;
  return (
    <Link
      to={`/app/courses/${folder.key}`}
      className="flex items-center gap-3 rounded-[16px] border border-border/60 bg-white/70 px-4 py-4 transition-colors hover:border-purple/40 sm:px-5"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple/10 text-purple">
        <FolderOpen className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-semibold text-text">{folder.name}</span>
        <span className="block text-[13px] text-text-secondary">
          {count === 0 ? "Aucune fiche" : `${count} fiche${count > 1 ? "s" : ""}`}
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-text-secondary" />
    </Link>
  );
}

export default function Courses() {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState<ApiSubject[] | null>(null);
  const [mine, setMine] = useState<string[]>([]);
  const [sheets, setSheets] = useState<ApiSheetSummary[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [sheetIdByCourse, setSheetIdByCourse] = useState<Record<string, string>>({});
  const [retryingId, setRetryingId] = useState<string | null>(null);

  function refresh() {
    Promise.all([
      api.listSubjects(token!),
      api.getMySubjectIds(token!),
      api.listSheets(token!),
      api.listCourses(token!),
    ]).then(([s, m, sh, c]) => {
      setSubjects(s.subjects);
      setMine(m.subjectIds);
      setSheets(sh.sheets);
      setCourses(c.courses);
      const map: Record<string, string> = {};
      for (const sheet of sh.sheets) map[sheet.courseId] = sheet.id;
      setSheetIdByCourse(map);
    });
  }

  useEffect(refresh, [token]);

  const { folders, unfiled } = useMemo(() => {
    const bySubject = new Map<string, ApiSheetSummary[]>();
    const loose: ApiSheetSummary[] = [];
    for (const sheet of sheets) {
      if (sheet.subjectId) bySubject.set(sheet.subjectId, [...(bySubject.get(sheet.subjectId) ?? []), sheet]);
      else loose.push(sheet);
    }
    // Toutes les matières communes, plus les matières perso de l'élève (choisies ou utilisées).
    const list: Folder[] = (subjects ?? [])
      .filter((s) => !s.isCustom || mine.includes(s.id) || bySubject.has(s.id))
      .map((s) => ({ key: s.id, name: s.name, sheets: bySubject.get(s.id) ?? [] }));
    list.sort((x, y) => Number(y.sheets.length > 0) - Number(x.sheets.length > 0) || x.name.localeCompare(y.name, "fr"));
    return { folders: list, unfiled: loose };
  }, [subjects, mine, sheets]);

  // Cours dont la fiche n'existe pas encore (échec ou en attente) : à relancer.
  const pending = courses.filter((c) => c.status === "failed" || c.status === "uploaded" || c.status === "processing");

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
      <p className="mt-1 text-[14px] text-text-secondary">Toutes tes fiches, rangées par matière.</p>

      <div className="mt-6">
        {subjects === null ? (
          <p className="text-[15px] text-text-secondary">Chargement…</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <FolderCard key={folder.key} folder={folder} />
            ))}
            {unfiled.length > 0 && <FolderCard folder={{ key: "unfiled", name: "Non rangées", sheets: unfiled }} />}
          </div>
        )}
      </div>

      {pending.length > 0 && (
        <div className="mt-8">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">À terminer</h2>
          <div className="mt-3 flex flex-col gap-2">
            {pending.map((course) => (
              <div
                key={course.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[12px] border border-border/60 bg-white px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-text">{course.title}</p>
                  {course.status === "failed" && course.errorMessage && (
                    <p className="mt-0.5 flex items-center gap-1 text-[12px] text-red-500">
                      <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{course.errorMessage}</span>
                    </p>
                  )}
                </div>
                {course.status === "processing" ? (
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-purple">
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyse en cours…
                  </span>
                ) : sheetIdByCourse[course.id] ? null : (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
