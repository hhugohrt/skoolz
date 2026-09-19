import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type AdminCourse } from "@/lib/api";

const FILTERS = [
  { id: "", label: "Tous" },
  { id: "failed", label: "En échec" },
  { id: "processing", label: "En cours" },
  { id: "uploaded", label: "En attente" },
  { id: "completed", label: "Terminés" },
];

const STATUS_STYLE: Record<string, string> = {
  failed: "bg-red-50 text-red-600",
  processing: "bg-purple/10 text-purple",
  uploaded: "bg-surface-2 text-text-secondary",
  completed: "bg-emerald-50 text-emerald-700",
};
const STATUS_LABEL: Record<string, string> = { failed: "Échec", processing: "En cours", uploaded: "En attente", completed: "Terminé" };

export function AdminCoursesTab() {
  const { token } = useAuth();
  const [status, setStatus] = useState("");
  const [courses, setCourses] = useState<AdminCourse[] | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(() => {
    api.adminCourses(token!, status || undefined).then(({ courses }) => setCourses(courses)).catch(() => setCourses([]));
  }, [token, status]);
  useEffect(load, [load]);

  async function remove(id: string) {
    await api.adminDeleteCourse(token!, id).catch(() => {});
    setConfirmId(null);
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStatus(f.id)}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              status === f.id ? "border-purple bg-purple text-white" : "border-border bg-white text-text-secondary hover:border-purple/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-[14px] border border-border/60 bg-white">
        {courses === null ? (
          <p className="p-4 text-[14px] text-text-secondary">Chargement…</p>
        ) : courses.length === 0 ? (
          <p className="p-4 text-[14px] text-text-secondary">Aucun cours.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {courses.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-text">{c.title}</p>
                  <p className="truncate text-[12px] text-text-secondary">
                    {c.userEmail} · {c.subjectName ?? "non rangé"} · {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                  {c.errorMessage && <p className="truncate text-[12px] text-red-500">{c.errorMessage}</p>}
                </div>
                <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:inline ${STATUS_STYLE[c.status] ?? ""}`}>
                  {STATUS_LABEL[c.status] ?? c.status}
                </span>
                {confirmId === c.id ? (
                  <span className="flex shrink-0 gap-1.5">
                    <button type="button" onClick={() => remove(c.id)} className="rounded-full bg-red-600 px-3 py-1.5 text-[12px] font-semibold text-white">
                      Confirmer
                    </button>
                    <button type="button" onClick={() => setConfirmId(null)} className="rounded-full border border-border px-3 py-1.5 text-[12px] font-semibold text-text">
                      Non
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(c.id)}
                    aria-label="Supprimer ce cours"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-2 text-[12px] text-text-secondary">Les 40 derniers cours. Le contenu des fiches n&rsquo;est pas affiché par respect de la vie privée.</p>
    </div>
  );
}
