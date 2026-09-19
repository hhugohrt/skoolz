import { useEffect, useState } from "react";
import { FolderCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, type ApiSheetDetail, type ApiSubject, type ApiSubjectSuggestion } from "@/lib/api";

interface SubjectPromptProps {
  sheet: ApiSheetDetail;
  suggestion: ApiSubjectSuggestion | null;
  onSheetChange: (sheet: ApiSheetDetail) => void;
}

// Affiché juste après la génération : propose de ranger la fiche dans la matière détectée par l'IA,
// d'en choisir une autre, ou de ne pas la ranger. L'élève garde toujours le dernier mot.
export function SubjectPrompt({ sheet, suggestion, onSheetChange }: SubjectPromptProps) {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [choosing, setChoosing] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.listSubjects(token!), api.getMySubjectIds(token!)])
      .then(([{ subjects: all }, { subjectIds }]) => {
        if (cancelled) return;
        const mine = all.filter((s) => subjectIds.includes(s.id));
        setSubjects(mine.length > 0 ? mine : all.filter((s) => !s.isCustom));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function assign(subjectId: string) {
    setBusy(true);
    setError(null);
    try {
      const { sheet: updated } = await api.setSheetSubject(token!, sheet.id, subjectId);
      onSheetChange(updated);
      setDone(updated.subjectName ?? "cette matière");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de ranger la fiche pour le moment.");
    } finally {
      setBusy(false);
    }
  }

  if (dismissed) return null;

  if (done) {
    return (
      <p className="mt-4 flex items-center gap-2 rounded-[14px] border border-purple/20 bg-purple/[0.06] px-4 py-3 text-[14px] font-semibold text-purple">
        <FolderCheck className="h-4 w-4" />
        Fiche rangée dans « {done} ».
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-[16px] border border-purple/25 bg-purple/[0.05] p-4 sm:p-5">
      <p className="text-[15px] font-semibold text-text">
        {suggestion
          ? `J'ai l'impression que c'est de la matière « ${suggestion.name} ». Je range ta fiche dedans ?`
          : "Dans quelle matière veux-tu ranger cette fiche ?"}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {suggestion && !choosing && (
          <button
            type="button"
            disabled={busy}
            onClick={() => assign(suggestion.id)}
            className="bg-cta-gradient flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-semibold text-white disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Oui, ranger dans {suggestion.name}
          </button>
        )}

        {!choosing && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setChoosing(true);
              setSelectedId(suggestion?.id ?? subjects[0]?.id ?? "");
            }}
            className="rounded-full border border-border bg-white px-4 py-2 text-[14px] font-semibold text-text transition-colors hover:border-purple/40 disabled:opacity-60"
          >
            {suggestion ? "Choisir une autre matière" : "Choisir une matière"}
          </button>
        )}

        {choosing && (
          <div className="w-full">
            <div role="radiogroup" aria-label="Matière" className="flex flex-wrap gap-2">
              {subjects.map((s) => {
                const active = s.id === selectedId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={busy}
                    onClick={() => setSelectedId(s.id)}
                    className={`rounded-full border px-4 py-2 text-[14px] font-semibold transition-colors disabled:opacity-60 ${
                      active
                        ? "border-purple bg-purple text-white"
                        : "border-border bg-white text-text hover:border-purple/40"
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={busy || !selectedId}
              onClick={() => assign(selectedId)}
              className="bg-cta-gradient mt-3 flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Ranger dans {subjects.find((s) => s.id === selectedId)?.name ?? "cette matière"}
            </button>
          </div>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => setDismissed(true)}
          className="rounded-full px-4 py-2 text-[14px] font-semibold text-text-secondary transition-colors hover:text-text disabled:opacity-60"
        >
          Ne pas ranger
        </button>
      </div>

      {error && <p className="mt-3 text-[13px] text-red-500">{error}</p>}
    </div>
  );
}
