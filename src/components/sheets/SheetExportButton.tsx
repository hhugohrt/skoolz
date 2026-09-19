import { useState } from "react";
import { Check, Download, ImageDown, Loader2 } from "lucide-react";
import type { ApiSheetDetail } from "@/lib/api";
import { isPhone } from "@/lib/device";
import { canShareFiles, downloadFiles, renderSheetPages, shareFiles } from "@/lib/sheetExport";
import type { Orientation, SheetStyle } from "@/lib/sheetStyles";

type Phase = "idle" | "rendering" | "ready" | "done" | "error";

// Sur téléphone : ouvre la feuille de partage pour enregistrer la fiche dans la galerie. Sur ordinateur : télécharge les images.
export function SheetExportButton({
  sheet,
  style,
  orientation,
}: {
  sheet: ApiSheetDetail;
  style: SheetStyle;
  orientation: Orientation;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [files, setFiles] = useState<File[]>([]);
  const phone = isPhone();

  async function deliver(pages: File[]) {
    if (canShareFiles(pages)) {
      try {
        await shareFiles(pages, sheet.title);
        setPhase("done");
      } catch (err) {
        const name = (err as Error).name;
        if (name === "AbortError") setPhase("idle"); // partage fermé par l'élève
        else if (name === "NotAllowedError") setPhase("ready"); // le geste est expiré : un second appui suffit
        else {
          downloadFiles(pages);
          setPhase("done");
        }
      }
    } else {
      downloadFiles(pages);
      setPhase("done");
    }
  }

  async function start() {
    setPhase("rendering");
    try {
      const pages = await renderSheetPages(sheet, style, orientation);
      if (pages.length === 0) throw new Error("empty");
      setFiles(pages);
      await deliver(pages);
    } catch {
      setPhase("error");
    }
  }

  const label = phone ? "Enregistrer dans la galerie" : "Télécharger en image";
  const busy = phase === "rendering";

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={phase === "ready" ? () => deliver(files) : start}
        disabled={busy}
        className="flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-[14px] font-semibold text-text transition-colors hover:border-purple/40 disabled:opacity-70"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin text-purple" />
        ) : phase === "done" ? (
          <Check className="h-4 w-4 text-purple" />
        ) : phase === "ready" ? (
          <Download className="h-4 w-4 text-purple" />
        ) : (
          <ImageDown className="h-4 w-4 text-purple" />
        )}
        {busy ? "Préparation…" : phase === "ready" ? "Toucher pour enregistrer" : phase === "done" ? "Enregistrée" : label}
      </button>
      {phase === "error" && (
        <p className="text-[12px] text-red-500">Impossible de créer l&rsquo;image pour le moment. Réessaie, ou utilise l&rsquo;impression PDF.</p>
      )}
      {phase === "done" && phone && (
        <p className="text-[12px] text-text-secondary">Choisis « Enregistrer l&rsquo;image » dans le menu de partage.</p>
      )}
    </div>
  );
}
