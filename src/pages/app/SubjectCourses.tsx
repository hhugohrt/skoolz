import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type ApiSheetSummary } from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";

// Toutes les fiches d'une matière (ou les fiches « non rangées »).
export default function SubjectCourses() {
  const { subjectId } = useParams();
  const { token } = useAuth();
  const [name, setName] = useState<string | null>(null);
  const [sheets, setSheets] = useState<ApiSheetSummary[] | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!subjectId) return;
    Promise.all([api.listSubjects(token!), api.listSheets(token!)])
      .then(([{ subjects }, { sheets }]) => {
        if (subjectId === "unfiled") {
          setName("Non rangées");
          setSheets(sheets.filter((s) => !s.subjectId));
          return;
        }
        const subject = subjects.find((s) => s.id === subjectId);
        if (!subject) return setNotFound(true);
        setName(subject.name);
        setSheets(sheets.filter((s) => s.subjectId === subjectId));
      })
      .catch(() => setNotFound(true));
  }, [token, subjectId]);

  return (
    <div>
      <Link to="/app/courses" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-purple hover:underline">
        <ArrowLeft className="h-4 w-4" /> Tes cours
      </Link>

      {notFound ? (
        <p className="mt-6 text-[15px] text-text-secondary">Matière introuvable.</p>
      ) : (
        <>
          <h1 className="mt-3 font-display text-[26px] font-bold text-text sm:text-[30px]">{name ?? "…"}</h1>

          <div className="mt-6">
            {sheets === null ? (
              <p className="text-[15px] text-text-secondary">Chargement…</p>
            ) : sheets.length === 0 ? (
              <EmptyState
                title="Aucune fiche dans cette matière"
                description="Importe un cours depuis l'accueil : Skoolz range tes fiches automatiquement."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sheets.map((sheet) => (
                  <Link
                    key={sheet.id}
                    to={`/app/sheets/${sheet.id}`}
                    className="flex flex-col rounded-[16px] border border-border/60 bg-white p-5 transition-colors hover:border-purple/40"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple/10 text-purple">
                      <FileText className="h-[18px] w-[18px]" />
                    </span>
                    <p className="mt-3 text-[16px] font-semibold text-text">{sheet.title}</p>
                    <p className="mt-1 line-clamp-2 text-[13px] text-text-secondary">{sheet.summary}</p>
                    <p className="mt-3 text-[12px] text-text-secondary">
                      {new Date(sheet.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
