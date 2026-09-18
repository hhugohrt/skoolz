import { RectangleHorizontal, RectangleVertical } from "lucide-react";
import { STYLE_OPTIONS, isPrintableStyle, type Orientation, type SheetLayout } from "@/lib/sheetStyles";

const ORIENTATIONS: { value: Orientation; label: string; icon: typeof RectangleVertical }[] = [
  { value: "portrait", label: "Portrait", icon: RectangleVertical },
  { value: "landscape", label: "Paysage", icon: RectangleHorizontal },
];

// Choix du style de fiche à la génération : texte, ou rendu imprimable A4 (colorée, compacte,
// carte mentale, schéma) avec son orientation. Modifiable ensuite depuis la fiche.
export function FormatToggle({ value, onChange }: { value: SheetLayout; onChange: (layout: SheetLayout) => void }) {
  return (
    <div>
      <div role="radiogroup" aria-label="Style de la fiche" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
        {STYLE_OPTIONS.map((option) => {
          const active = option.value === value.view;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange({ view: option.value, orientation: option.orientation })}
              className={`flex flex-col items-start gap-2 rounded-[14px] border px-3.5 py-3 text-left transition-colors ${
                active ? "border-purple bg-purple/[0.06]" : "border-border bg-white hover:border-purple/40"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${active ? "bg-purple text-white" : "bg-purple/10 text-purple"}`}
              >
                <option.icon className="h-4 w-4" strokeWidth={2.25} />
              </span>
              <span>
                <span className="block text-[14px] font-semibold leading-tight text-text">{option.label}</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-text-secondary">{option.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {isPrintableStyle(value.view) && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-[13px] font-semibold text-text-secondary">Format A4</span>
          <div role="radiogroup" aria-label="Orientation" className="inline-flex rounded-full border border-border bg-white p-1">
            {ORIENTATIONS.map((option) => {
              const active = option.value === value.orientation;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange({ ...value, orientation: option.value })}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                    active ? "bg-purple text-white" : "text-text-secondary hover:text-text"
                  }`}
                >
                  <option.icon className="h-3.5 w-3.5" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
