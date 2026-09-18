import { useEffect, useMemo, useRef, useState } from "react";
import { Printer, RectangleHorizontal, RectangleVertical } from "lucide-react";
import type { ApiSheetDetail } from "@/lib/api";
import { A4_PX, buildSheetHtml, fitSheetToPage, type Orientation } from "@/lib/sheetHtml";

interface SheetA4PreviewProps {
  sheet: ApiSheetDetail;
  orientation: Orientation;
  onOrientationChange: (orientation: Orientation) => void;
}

const ORIENTATIONS: { value: Orientation; label: string; icon: typeof RectangleVertical }[] = [
  { value: "portrait", label: "Portrait", icon: RectangleVertical },
  { value: "landscape", label: "Paysage", icon: RectangleHorizontal },
];

export function SheetA4Preview({ sheet, orientation, onOrientationChange }: SheetA4PreviewProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperWidth, setWrapperWidth] = useState(0);
  const [contentHeight, setContentHeight] = useState<number>(A4_PX[orientation].h);

  const html = useMemo(() => buildSheetHtml(sheet, orientation), [sheet, orientation]);
  const page = A4_PX[orientation];
  const scale = wrapperWidth > 0 ? Math.min(1, wrapperWidth / page.w) : 1;
  const frameHeight = Math.max(page.h, contentHeight);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWrapperWidth(el.clientWidth));
    observer.observe(el);
    setWrapperWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  async function handleLoad() {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    // Les polices manuscrites changent les dimensions du texte : on mesure après leur chargement.
    await doc.fonts?.ready.catch(() => {});
    fitSheetToPage(doc, orientation);
    setContentHeight(doc.documentElement.scrollHeight);
  }

  function handlePrint() {
    const frame = frameRef.current?.contentWindow;
    frame?.focus();
    frame?.print();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Orientation" className="inline-flex rounded-full border border-border bg-white p-1">
          {ORIENTATIONS.map((option) => {
            const active = option.value === orientation;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onOrientationChange(option.value)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-semibold transition-colors ${
                  active ? "bg-purple text-white" : "text-text-secondary hover:text-text"
                }`}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="bg-cta-gradient flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(109,74,255,0.25)] transition-transform hover:brightness-105 active:scale-[0.98]"
        >
          <Printer className="h-4 w-4" />
          Imprimer / Enregistrer en PDF
        </button>
      </div>

      <div ref={wrapperRef} className="mt-4 overflow-hidden rounded-[14px] border border-border/60 bg-surface-2 p-0">
        <div style={{ width: page.w * scale, height: frameHeight * scale, margin: "0 auto" }}>
          <iframe
            ref={frameRef}
            title="Aperçu de la fiche A4"
            srcDoc={html}
            sandbox="allow-same-origin allow-modals"
            onLoad={handleLoad}
            style={{
              width: page.w,
              height: frameHeight,
              border: 0,
              background: "#fff",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              display: "block",
            }}
          />
        </div>
      </div>
      <p className="mt-2 text-center text-[12px] text-text-secondary">
        Format A4 {orientation === "portrait" ? "portrait" : "paysage"} — dans la fenêtre d&rsquo;impression, choisis
        « Enregistrer au format PDF » pour la télécharger, et laisse les marges sur « Par défaut ».
      </p>
    </div>
  );
}
