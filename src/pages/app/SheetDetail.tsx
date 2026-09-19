import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { GraduationCap, HelpCircle, Layers, Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type ApiSheetDetail, type ApiSubjectSuggestion } from "@/lib/api";
import { SheetA4Preview } from "@/components/sheets/SheetA4Preview";
import { SheetEditor } from "@/components/sheets/SheetEditor";
import { SubjectPrompt } from "@/components/sheets/SubjectPrompt";
import { LockedArea } from "@/components/billing/LockedArea";
import { SheetExportButton } from "@/components/sheets/SheetExportButton";
import { SECTION_LABELS } from "@/lib/sectionLabels";
import { DEFAULT_LAYOUT, STYLE_OPTIONS, isPrintableStyle, type Orientation, type SheetLayout, type SheetView } from "@/lib/sheetStyles";

interface NavigationState {
  layout?: SheetLayout;
  suggestedSubject?: ApiSubjectSuggestion | null;
  justGenerated?: boolean;
}

export default function SheetDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const location = useLocation();
  const navState = (location.state as NavigationState | null) ?? {};
  const requested = navState.layout ?? DEFAULT_LAYOUT;

  const [sheet, setSheet] = useState<ApiSheetDetail | null>(null);
  const [error, setError] = useState(false);
  const [view, setView] = useState<SheetView>(requested.view);
  const [orientation, setOrientation] = useState<Orientation>(requested.orientation);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  // Décidé une seule fois au chargement : le bandeau doit rester affiché après le rangement pour confirmer.
  const [showSubjectPrompt, setShowSubjectPrompt] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .getSheet(token!, id)
      .then(({ sheet }) => {
        setSheet(sheet);
        setShowSubjectPrompt(navState.justGenerated === true && sheet.subjectId === null);
      })
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  if (error) {
    return <p className="text-[15px] text-text-secondary">Fiche introuvable.</p>;
  }

  if (!sheet) {
    return <p className="text-[15px] text-text-secondary">Chargement…</p>;
  }

  function selectView(option: (typeof STYLE_OPTIONS)[number]) {
    setView(option.value);
    setOrientation(option.orientation);
    setEditing(false);
  }

  return (
    <div>
      <Link to={sheet.subjectId ? `/app/courses/${sheet.subjectId}` : "/app/courses"} className="text-[14px] font-semibold text-purple hover:underline">
        ← {sheet.subjectName ?? "Mes cours"}
      </Link>

      <div className="mt-4 flex items-center gap-2 text-[14px] text-text-secondary">
        {sheet.subjectName && <span className="font-semibold text-purple">{sheet.subjectName}</span>}
        {sheet.chapter && <span>· {sheet.chapter}</span>}
      </div>

      {!editing && (
        <>
          <h1 className="font-display mt-2 text-[28px] font-bold text-text sm:text-[34px]">{sheet.title}</h1>
        </>
      )}

      {showSubjectPrompt && !editing && (
        <SubjectPrompt sheet={sheet} suggestion={navState.suggestedSubject ?? null} onSheetChange={setSheet} />
      )}

      <LockedArea locked={sheet.locked && !editing}>
      {!editing && (
        <div className="mt-4 rounded-[14px] border border-border/60 bg-surface-2/60 p-4">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Résumé express</p>
          <p className="mt-1 text-[15px] text-text">{sheet.summary}</p>
        </div>
      )}

      {!editing && (
        <div role="tablist" className="mt-6 flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((option) => {
            const active = option.value === view;
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectView(option)}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[14px] font-semibold transition-colors ${
                  active
                    ? "border-purple bg-purple text-white"
                    : "border-border bg-white text-text-secondary hover:border-purple/40 hover:text-text"
                }`}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      {isPrintableStyle(view) && !editing ? (
        <div className="mt-4">
          <SheetA4Preview sheet={sheet} style={view} orientation={orientation} onOrientationChange={setOrientation} />
        </div>
      ) : editing ? (
        <SheetEditor
          sheet={sheet}
          onCancel={() => setEditing(false)}
          onSaved={(updated) => {
            setSheet(updated);
            setEditing(false);
            setSaved(true);
          }}
        />
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between gap-3">
            {saved ? (
              <p className="text-[13px] font-semibold text-purple">Modifications enregistrées.</p>
            ) : (
              <span />
            )}
            <div className="flex flex-wrap items-start gap-2">
            <SheetExportButton sheet={sheet} style="colorful" orientation="portrait" />
            <button
              type="button"
              onClick={() => {
                setSaved(false);
                setEditing(true);
              }}
              className="flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-[14px] font-semibold text-text transition-colors hover:border-purple/40"
            >
              <Pencil className="h-4 w-4 text-purple" />
              Modifier la fiche
            </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-4">
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
        </>
      )}

      </LockedArea>

      {!editing && !sheet.locked && (
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
      )}
    </div>
  );
}
