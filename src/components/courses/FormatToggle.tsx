import { FileText, RectangleHorizontal, RectangleVertical } from "lucide-react";
import type { SheetLayout } from "@/lib/api";

const OPTIONS: { value: SheetLayout; label: string; hint: string; icon: typeof FileText }[] = [
  { value: "text", label: "Fiche texte", hint: "Simple à relire", icon: FileText },
  { value: "portrait", label: "Fiche A4 portrait", hint: "Colorée, imprimable", icon: RectangleVertical },
  { value: "landscape", label: "Fiche A4 paysage", hint: "Colorée, imprimable", icon: RectangleHorizontal },
];

export function FormatToggle({ value, onChange }: { value: SheetLayout; onChange: (layout: SheetLayout) => void }) {
  return (
    <div role="radiogroup" aria-label="Format de la fiche" className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-3 rounded-[14px] border px-4 py-3 text-left transition-colors ${
              active ? "border-purple bg-purple/[0.06]" : "border-border bg-white hover:border-purple/40"
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${active ? "bg-purple text-white" : "bg-purple/10 text-purple"}`}
            >
              <option.icon className="h-4 w-4" strokeWidth={2.25} />
            </span>
            <span>
              <span className="block text-[14px] font-semibold text-text">{option.label}</span>
              <span className="block text-[12px] text-text-secondary">{option.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
