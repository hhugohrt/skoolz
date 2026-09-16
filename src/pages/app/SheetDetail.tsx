import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { GraduationCap, HelpCircle, Layers } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type ApiSheetDetail } from "@/lib/api";

const SECTION_LABELS: Record<string, string> = {
  notion: "Notion essentielle",
  definition: "Définition",
  formula: "Formule",
  example: "Exemple",
  key_point: "À retenir",
  common_mistake: "Erreur fréquente",
  date: "Date",
  concept: "Concept",
  method: "Méthode",
};

export default function SheetDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [sheet, setSheet] = useState<ApiSheetDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .getSheet(token!, id)
      .then(({ sheet }) => setSheet(sheet))
      .catch(() => setError(true));
  }, [token, id]);

  if (error) {
    return <p className="text-[15px] text-text-secondary">Fiche introuvable.</p>;
  }

  if (!sheet) {
    return <p className="text-[15px] text-text-secondary">Chargement…</p>;
  }

  return (
    <div>
      <Link to="/app/sheets" className="text-[14px] font-semibold text-purple hover:underline">
        ← Toutes les fiches
      </Link>

      <div className="mt-4 flex items-center gap-2 text-[14px] text-text-secondary">
        {sheet.subjectName && <span className="font-semibold text-purple">{sheet.subjectName}</span>}
        {sheet.chapter && <span>· {sheet.chapter}</span>}
      </div>

      <h1 className="font-display mt-2 text-[28px] font-bold text-text sm:text-[34px]">{sheet.title}</h1>

      <div className="mt-4 rounded-[14px] border border-border/60 bg-surface-2/60 p-4">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Résumé express</p>
        <p className="mt-1 text-[15px] text-text">{sheet.summary}</p>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {sheet.sections.map((section) => (
          <div key={section.id} className="rounded-[14px] border border-border/60 bg-white p-5">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-purple">
              {SECTION_LABELS[section.type] ?? section.type}
            </p>
            {section.title && <p className="mt-1 text-[16px] font-semibold text-text">{section.title}</p>}
            <p className="mt-1.5 whitespace-pre-line text-[15px] leading-relaxed text-text-secondary">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 rounded-[14px] border border-border bg-surface-2/60 px-4 py-3 text-[14px] font-semibold text-text-secondary opacity-70"
          title="Bientôt disponible"
        >
          <GraduationCap className="h-4 w-4" />
          Réviser cette fiche
        </button>
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 rounded-[14px] border border-border bg-surface-2/60 px-4 py-3 text-[14px] font-semibold text-text-secondary opacity-70"
          title="Bientôt disponible"
        >
          <HelpCircle className="h-4 w-4" />
          Faire un quiz
        </button>
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 rounded-[14px] border border-border bg-surface-2/60 px-4 py-3 text-[14px] font-semibold text-text-secondary opacity-70"
          title="Bientôt disponible"
        >
          <Layers className="h-4 w-4" />
          Créer des flashcards
        </button>
      </div>
      <p className="mt-2 text-center text-[12px] text-text-secondary">
        Quiz et flashcards arrivent dans une prochaine version.
      </p>
    </div>
  );
}
