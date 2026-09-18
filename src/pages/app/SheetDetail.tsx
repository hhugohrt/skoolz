import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { GraduationCap, HelpCircle, Layers, Download, TriangleAlert } from "lucide-react";
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
  const location = useLocation();
  const imagesError = (location.state as { imagesError?: string } | null)?.imagesError;
  const [sheet, setSheet] = useState<ApiSheetDetail | null>(null);
  const [error, setError] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    api
      .getSheet(token!, id)
      .then(({ sheet }) => setSheet(sheet))
      .catch(() => setError(true));
  }, [token, id]);

  useEffect(() => {
    if (!sheet || sheet.images.length === 0) return;
    let cancelled = false;
    const urls: string[] = [];
    Promise.all(sheet.images.map((image) => api.getSheetImageBlob(token!, sheet.id, image.id)))
      .then((blobs) => {
        if (cancelled) return;
        blobs.forEach((blob) => urls.push(URL.createObjectURL(blob)));
        setImageUrls([...urls]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [sheet, token]);

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

      {imagesError && (
        <p className="mt-4 flex items-start gap-2 rounded-[14px] border border-red-200 bg-red-50 p-3 text-[14px] text-red-600">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>La fiche visuelle n&rsquo;a pas pu être créée : {imagesError} Ta fiche texte est disponible ci-dessous.</span>
        </p>
      )}

      {sheet.images.length > 0 && (
        <div className="mt-6">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Fiche visuelle</p>
          <p className="mt-1 text-[13px] text-text-secondary">
            Image dessinée par l&rsquo;IA : le texte peut contenir des erreurs. Fie-toi aux sections ci-dessous.
          </p>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sheet.images.map((image, index) => (
              <div key={image.id} className="overflow-hidden rounded-[14px] border border-border/60 bg-white">
                {imageUrls[index] ? (
                  <>
                    <img src={imageUrls[index]} alt={`Fiche visuelle ${index + 1}`} className="w-full" />
                    <a
                      href={imageUrls[index]}
                      download={`${sheet.title}${sheet.images.length > 1 ? ` (${index + 1})` : ""}.png`}
                      className="flex items-center justify-center gap-2 border-t border-border/60 px-4 py-3 text-[14px] font-semibold text-purple transition-colors hover:bg-purple/[0.05]"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger
                    </a>
                  </>
                ) : (
                  <div className="aspect-[2/3] animate-pulse bg-surface-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
        <Link to="/app/revise" className="flex items-center justify-center gap-2 rounded-[14px] border border-border bg-surface-2/60 px-4 py-3 text-[14px] font-semibold text-text transition-colors hover:bg-surface-2">
          <GraduationCap className="h-4 w-4" />
          Réviser cette fiche
        </Link>
        <Link to={`/app/sheets/${id}/quiz`} className="flex items-center justify-center gap-2 rounded-[14px] border border-border bg-surface-2/60 px-4 py-3 text-[14px] font-semibold text-text transition-colors hover:bg-purple/10 hover:text-purple">
          <HelpCircle className="h-4 w-4" />
          Faire un quiz
        </Link>
        <Link to={`/app/sheets/${id}/flashcards`} className="flex items-center justify-center gap-2 rounded-[14px] border border-border bg-surface-2/60 px-4 py-3 text-[14px] font-semibold text-text transition-colors hover:bg-purple/10 hover:text-purple">
          <Layers className="h-4 w-4" />
          Créer des flashcards
        </Link>
      </div>
    </div>
  );
}
