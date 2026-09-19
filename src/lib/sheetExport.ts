import { toCanvas } from "html-to-image";
import type { ApiSheetDetail } from "@/lib/api";
import { A4_PX, buildSheetHtml, finalizeSheetDocument } from "@/lib/sheetHtml";
import type { Orientation, SheetStyle } from "@/lib/sheetStyles";

// Dessine la fiche dans un cadre invisible et renvoie une image PNG par page A4.
export async function renderSheetPages(sheet: ApiSheetDetail, style: SheetStyle, orientation: Orientation): Promise<File[]> {
  const page = A4_PX[orientation];
  const frame = document.createElement("iframe");
  frame.setAttribute("sandbox", "allow-same-origin");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = `position:fixed;left:-99999px;top:0;width:${page.w}px;height:${page.h}px;border:0;visibility:hidden`;
  frame.srcdoc = buildSheetHtml(sheet, orientation, style);

  try {
    await new Promise<void>((resolve, reject) => {
      frame.onload = () => resolve();
      frame.onerror = () => reject(new Error("frame"));
      document.body.appendChild(frame);
    });
    const doc = frame.contentDocument!;
    await doc.fonts?.ready.catch(() => {});
    finalizeSheetDocument(doc, style, orientation);

    const height = Math.max(page.h, doc.documentElement.scrollHeight);
    const pageCount = Math.max(1, Math.round(height / page.h));
    frame.style.height = `${height}px`;

    // Un très grand canvas dépasse la limite des téléphones : on baisse un peu la définition au-delà de 2 pages.
    const pixelRatio = pageCount <= 2 ? 2 : 1.5;
    const canvas = await toCanvas(doc.documentElement, {
      width: page.w,
      height,
      pixelRatio,
      backgroundColor: "#ffffff",
    });

    const files: File[] = [];
    const sliceHeight = Math.round(page.h * pixelRatio);
    const name = sheet.title.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 60) || "fiche";
    for (let index = 0; index < pageCount; index++) {
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = Math.min(sliceHeight, canvas.height - index * sliceHeight);
      if (slice.height <= 0) break;
      slice.getContext("2d")!.drawImage(canvas, 0, index * sliceHeight, canvas.width, slice.height, 0, 0, canvas.width, slice.height);
      const blob = await new Promise<Blob | null>((resolve) => slice.toBlob(resolve, "image/png"));
      if (blob) files.push(new File([blob], pageCount > 1 ? `${name}-page-${index + 1}.png` : `${name}.png`, { type: "image/png" }));
    }
    return files;
  } finally {
    frame.remove();
  }
}

export function canShareFiles(files: File[]): boolean {
  return typeof navigator !== "undefined" && typeof navigator.canShare === "function" && navigator.canShare({ files });
}

// Feuille de partage du téléphone (« Enregistrer l'image », Photos, WhatsApp…). Lève NotAllowedError
// si le geste de l'utilisateur est trop ancien : l'appelant propose alors un second appui.
export async function shareFiles(files: File[], title: string): Promise<void> {
  await navigator.share({ files, title });
}

export function downloadFiles(files: File[]): void {
  files.forEach((file, index) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    // Les navigateurs bloquent plusieurs téléchargements simultanés : on les espace.
    setTimeout(() => {
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, index * 400);
  });
}
