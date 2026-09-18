import type { ApiSheetDetail, ApiSheetSection } from "@/lib/api";

export type Orientation = "portrait" | "landscape";

// Dimensions A4 en px CSS (96 dpi) : sert à l'aperçu à l'écran.
export const A4_PX = { portrait: { w: 794, h: 1123 }, landscape: { w: 1123, h: 794 } } as const;

interface Theme {
  label: string;
  bg: string;
  border: string;
  accent: string;
}

const THEMES: Record<string, Theme> = {
  definition: { label: "Définition", bg: "#eaf2ff", border: "#bcd4fb", accent: "#2563eb" },
  formula: { label: "Formule", bg: "#f1ebff", border: "#d3c1fb", accent: "#6d4aff" },
  notion: { label: "Notion", bg: "#e9f8ee", border: "#b9e6c8", accent: "#15803d" },
  example: { label: "Exemple", bg: "#fff3e4", border: "#fbd5a1", accent: "#c2570c" },
  key_point: { label: "À savoir par cœur", bg: "#fff0f3", border: "#f9bccb", accent: "#e11d48" },
  common_mistake: { label: "Erreur fréquente", bg: "#fff1f0", border: "#f7b7b1", accent: "#dc2626" },
  date: { label: "Date", bg: "#e6f7f7", border: "#a9e3e3", accent: "#0f766e" },
  concept: { label: "Concept", bg: "#eceeff", border: "#c4c9fb", accent: "#4f46e5" },
  method: { label: "Méthode", bg: "#fff8dc", border: "#f3e08a", accent: "#a16207" },
};

const FALLBACK_THEME = THEMES.notion;

// Tout texte issu de l'IA est échappé : la fiche est injectée dans un document HTML.
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pretty(value: string): string {
  return esc(value.replace(/\s->\s/g, " → ").replace(/\s=>\s/g, " ⇒ "));
}

function renderContent(section: ApiSheetSection): string {
  const lines = section.content.split("\n").map((l) => l.trim());
  const isFormula = section.type === "formula";
  const out: string[] = [];
  let list: string[] = [];

  const flush = () => {
    if (list.length > 0) {
      out.push(`<ul>${list.map((item) => `<li>${pretty(item)}</li>`).join("")}</ul>`);
      list = [];
    }
  };

  for (const line of lines) {
    if (line === "") {
      flush();
      continue;
    }
    const bullet = line.match(/^[-•*]\s+(.*)$/);
    if (bullet) {
      list.push(bullet[1]);
      continue;
    }
    flush();
    out.push(isFormula ? `<div class="formula">${pretty(line)}</div>` : `<p>${pretty(line)}</p>`);
  }
  flush();
  return out.join("");
}

// Taille de police selon la quantité de texte : une fiche courte reste lisible,
// une fiche dense tient sur la page.
function baseFontPt(totalChars: number): number {
  if (totalChars < 500) return 13;
  if (totalChars < 1000) return 11.5;
  if (totalChars < 1800) return 10.5;
  if (totalChars < 2800) return 9.5;
  return 8.6;
}

export function buildSheetHtml(sheet: ApiSheetDetail, orientation: Orientation): string {
  const totalChars = sheet.sections.reduce((n, s) => n + s.content.length + (s.title?.length ?? 0), 0);
  const fontPt = baseFontPt(totalChars);
  const columns = orientation === "landscape" ? 3 : 2;

  const ordered = [...sheet.sections.filter((s) => s.type !== "key_point"), ...sheet.sections.filter((s) => s.type === "key_point")];
  let counter = 0;

  const cards = ordered
    .map((section) => {
      const theme = THEMES[section.type] ?? FALLBACK_THEME;
      const isKey = section.type === "key_point";
      if (!isKey) counter += 1;
      const heading = section.title ?? theme.label;
      return `<section class="card" style="--bg:${theme.bg};--bd:${theme.border};--ac:${theme.accent}">
  <div class="tag">${esc(theme.label)}</div>
  <h2>${isKey ? "★" : `<span class="num">${counter}</span>`}<span>${esc(heading)}</span></h2>
  <div class="body">${renderContent(section)}</div>
</section>`;
    })
    .join("\n");

  const meta = [sheet.subjectName, sheet.chapter].filter(Boolean).join(" · ");
  const date = new Date(sheet.createdAt).toLocaleDateString("fr-FR");

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>${esc(sheet.title)}</title>
<style>
  @page { size: A4 ${orientation}; margin: 8mm; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; padding: 8mm; background: #fff; color: #16161d;
    font-family: "Inter","Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;
    font-size: ${fontPt}pt; line-height: 1.38; }
  @media print { body { padding: 0; } }
  header { display: flex; align-items: stretch; gap: 5mm; padding: 4.5mm 6mm; margin-bottom: 4mm;
    border: 0.5mm solid #b9cdfa; border-radius: 4mm; background: linear-gradient(120deg,#e3edff,#efe8ff); }
  header .titles { flex: 1; min-width: 0; }
  header h1 { margin: 0; font-size: 1.95em; line-height: 1.1; letter-spacing: -0.01em; color: #1d2a5c; }
  header .meta { margin-top: 1.5mm; font-size: 0.95em; font-weight: 600; color: #6d4aff; }
  header .note { flex: 0 0 34%; align-self: center; transform: rotate(1.5deg); padding: 2.5mm 3.5mm;
    background: #fff7c2; border-radius: 1.5mm; font-size: 0.82em; line-height: 1.35; color: #4a4320;
    box-shadow: 0 1mm 2mm rgba(0,0,0,.12); }
  .cards { column-count: ${columns}; column-gap: 4mm; }
  .card { break-inside: avoid; page-break-inside: avoid; margin: 0 0 4mm; padding: 3mm 3.5mm 3.2mm;
    background: var(--bg); border: 0.4mm solid var(--bd); border-radius: 3.2mm; }
  .tag { font-size: 0.66em; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--ac); opacity: .85; }
  .card h2 { display: flex; align-items: center; gap: 2mm; margin: 0.6mm 0 1.6mm; font-size: 1.12em;
    line-height: 1.2; text-transform: uppercase; letter-spacing: .01em; color: var(--ac); }
  .num { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 1.45em; height: 1.45em;
    border-radius: 50%; background: var(--ac); color: #fff; font-size: 0.85em; font-weight: 800; }
  .body p { margin: 0 0 1.3mm; }
  .body p:last-child, .body ul:last-child { margin-bottom: 0; }
  .body ul { margin: 0 0 1.3mm; padding: 0; list-style: none; }
  .body li { position: relative; padding-left: 4.2mm; margin-bottom: 0.9mm; }
  .body li::before { content: ""; position: absolute; left: 0.5mm; top: 0.62em; width: 1.7mm; height: 1.7mm;
    border-radius: 50%; background: var(--ac); }
  .formula { margin: 1mm 0; padding: 2mm 2.5mm; text-align: center; background: rgba(255,255,255,.85);
    border: 0.3mm solid var(--bd); border-radius: 2mm; font-family: "Cambria Math","STIX Two Math","Times New Roman",serif;
    font-size: 1.08em; font-style: italic; overflow-wrap: anywhere; }
  footer { margin-top: 1mm; display: flex; justify-content: space-between; font-size: 0.7em; color: #8a8a96; }
  footer b { color: #6d4aff; }
</style></head>
<body>
<header>
  <div class="titles"><h1>${esc(sheet.title)}</h1>${meta ? `<div class="meta">${esc(meta)}</div>` : ""}</div>
  ${sheet.summary ? `<div class="note">${esc(sheet.summary)}</div>` : ""}
</header>
<main class="cards">
${cards}
</main>
<footer><span><b>skoolz</b> · fiche de révision</span><span>${esc(date)}</span></footer>
</body></html>`;
}

// Agrandit le texte d'une fiche courte pour qu'elle remplisse la page A4 (sans jamais
// dépasser : on recule d'un cran si le débordement apparaît). Une fiche déjà longue
// garde sa taille par défaut et passe sur plusieurs pages.
export function fitSheetToPage(doc: Document, orientation: Orientation): void {
  const header = doc.querySelector("header");
  const footer = doc.querySelector("footer");
  if (!header || !footer) return;

  const usable = A4_PX[orientation].h - 61; // marges @page de 8 mm en haut et en bas
  const measure = () => footer.getBoundingClientRect().bottom - header.getBoundingClientRect().top;
  const body = doc.body;
  const start = parseFloat(doc.defaultView?.getComputedStyle(body).fontSize ?? "14");
  if (measure() >= usable) return;

  let size = start;
  for (let i = 0; i < 10; i++) {
    const h = measure();
    const ratio = (usable * 0.97) / h;
    if (Math.abs(1 - ratio) < 0.015) break;
    const next = Math.min(Math.max(size * Math.sqrt(ratio), start), start * 1.6);
    if (next === size) break;
    size = next;
    body.style.fontSize = `${size}px`;
  }
  while (measure() > usable && size > start) {
    size = Math.max(start, size * 0.96);
    body.style.fontSize = `${size}px`;
  }
}
