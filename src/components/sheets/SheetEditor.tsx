import { useState } from "react";
import { ArrowDown, ArrowUp, Check, Loader2, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, type ApiSheetDetail } from "@/lib/api";
import { SECTION_LABELS } from "@/lib/sectionLabels";

interface DraftSection {
  key: number;
  type: string;
  title: string;
  content: string;
}

interface SheetEditorProps {
  sheet: ApiSheetDetail;
  onSaved: (sheet: ApiSheetDetail) => void;
  onCancel: () => void;
}

const fieldClass =
  "w-full rounded-[10px] border border-border bg-white px-3 py-2 text-[15px] text-text outline-none transition-colors focus:border-purple";

// Édition manuelle de la fiche : titre, résumé, et chaque section (type, titre, contenu, ordre).
// Les rendus A4 (colorée, compacte, carte mentale, schéma) se recalculent à partir de ces données.
export function SheetEditor({ sheet, onSaved, onCancel }: SheetEditorProps) {
  const { token } = useAuth();
  const [title, setTitle] = useState(sheet.title);
  const [summary, setSummary] = useState(sheet.summary);
  const [nextKey, setNextKey] = useState(sheet.sections.length);
  const [sections, setSections] = useState<DraftSection[]>(
    sheet.sections.map((s, index) => ({ key: index, type: s.type, title: s.title ?? "", content: s.content })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(key: number, patch: Partial<DraftSection>) {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }

  function move(index: number, delta: -1 | 1) {
    setSections((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  function addSection() {
    setSections((prev) => [...prev, { key: nextKey, type: "notion", title: "", content: "" }]);
    setNextKey((k) => k + 1);
  }

  async function save() {
    setError(null);
    if (title.trim().length === 0) {
      setError("Le titre ne peut pas être vide.");
      return;
    }
    if (sections.length === 0) {
      setError("Une fiche doit contenir au moins une section.");
      return;
    }
    if (sections.some((s) => s.content.trim().length === 0)) {
      setError("Une section est vide : remplis-la ou supprime-la.");
      return;
    }

    setSaving(true);
    try {
      const { sheet: saved } = await api.updateSheet(token!, sheet.id, {
        title,
        summary,
        sections: sections.map((s) => ({ type: s.type, title: s.title.trim() || null, content: s.content })),
      });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer les modifications.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="rounded-[14px] border border-border/60 bg-white p-4 sm:p-5">
        <label className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary" htmlFor="sheet-title">
          Titre
        </label>
        <input
          id="sheet-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className={`${fieldClass} mt-1 text-[18px] font-semibold`}
        />
        <label
          className="mt-4 block text-[12px] font-semibold uppercase tracking-wide text-text-secondary"
          htmlFor="sheet-summary"
        >
          Résumé express
        </label>
        <textarea
          id="sheet-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={2}
          className={`${fieldClass} mt-1`}
        />
      </div>

      <p className="mt-4 text-[13px] text-text-secondary">
        Une ligne par information. Commence une ligne par « - » pour en faire une puce, et écris « Libellé : valeur » pour
        mettre le libellé en gras.
      </p>

      <div className="mt-2 flex flex-col gap-3">
        {sections.map((section, index) => (
          <div key={section.key} className="rounded-[14px] border border-border/60 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={section.type}
                onChange={(e) => update(section.key, { type: e.target.value })}
                aria-label="Type de section"
                className="rounded-[10px] border border-border bg-white px-2.5 py-2 text-[13px] font-semibold text-purple outline-none focus:border-purple"
              >
                {Object.entries(SECTION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                value={section.title}
                onChange={(e) => update(section.key, { title: e.target.value })}
                placeholder="Titre de la section"
                aria-label="Titre de la section"
                maxLength={200}
                className={`${fieldClass} min-w-[160px] flex-1 font-semibold`}
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Monter la section"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-2 disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === sections.length - 1}
                  aria-label="Descendre la section"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-2 disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSections((prev) => prev.filter((s) => s.key !== section.key))}
                  aria-label="Supprimer la section"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <textarea
              value={section.content}
              onChange={(e) => update(section.key, { content: e.target.value })}
              rows={Math.max(3, section.content.split("\n").length + 1)}
              aria-label="Contenu de la section"
              className={`${fieldClass} mt-2 leading-relaxed`}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSection}
        className="mt-3 flex items-center gap-2 rounded-full border border-dashed border-purple/50 px-4 py-2.5 text-[14px] font-semibold text-purple transition-colors hover:bg-purple/[0.05]"
      >
        <Plus className="h-4 w-4" />
        Ajouter une section
      </button>

      {error && <p className="mt-4 text-[14px] text-red-500">{error}</p>}

      <div className="sticky bottom-3 mt-6 flex flex-wrap items-center justify-end gap-2 rounded-[16px] border border-border bg-white/95 p-3 shadow-[0_10px_30px_rgba(54,44,120,0.12)] backdrop-blur">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2.5 text-[14px] font-semibold text-text transition-colors hover:border-purple/40 disabled:opacity-60"
        >
          <X className="h-4 w-4" />
          Annuler
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="bg-cta-gradient flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Enregistrer
        </button>
      </div>
    </div>
  );
}
