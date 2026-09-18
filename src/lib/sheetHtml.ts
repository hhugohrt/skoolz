import type { ApiSheetDetail, ApiSheetSection } from "@/lib/api";

export type Orientation = "portrait" | "landscape";

// Dimensions A4 en px CSS (96 dpi) : sert à l'aperçu à l'écran.
export const A4_PX = { portrait: { w: 794, h: 1123 }, landscape: { w: 1123, h: 794 } } as const;

interface Theme {
  label: string;
  icon: string;
  bg: string; // fond de la carte
  ac: string; // couleur d'accent (bordure, titre, puces)
  hl: string; // surlignage du titre
  sh: string; // ombre décalée
  tape: string; // adhésif décoratif
}

const THEMES: Record<string, Theme> = {
  definition: { label: "Définition", icon: "📖", bg: "#e8f1ff", ac: "#2b62d9", hl: "rgba(43,98,217,.20)", sh: "#b9cff7", tape: "#9ec0ff" },
  formula: { label: "Formule", icon: "🧮", bg: "#f0eaff", ac: "#6a45e8", hl: "rgba(106,69,232,.20)", sh: "#cfc0f7", tape: "#c6b3ff" },
  notion: { label: "Notion", icon: "💡", bg: "#e7f7ec", ac: "#1d8a4a", hl: "rgba(29,138,74,.20)", sh: "#b5e0c2", tape: "#9fdcb3" },
  example: { label: "Exemple", icon: "✏️", bg: "#fff1e0", ac: "#d2650f", hl: "rgba(210,101,15,.20)", sh: "#f6cf9d", tape: "#ffcf8f" },
  key_point: { label: "À savoir par cœur", icon: "❤️", bg: "#fff5c9", ac: "#e0294d", hl: "rgba(224,41,77,.16)", sh: "#f3dd8a", tape: "#ffb3c1" },
  common_mistake: { label: "Attention piège", icon: "⚠️", bg: "#ffecea", ac: "#d92d20", hl: "rgba(217,45,32,.18)", sh: "#f4b8b2", tape: "#ffb4ac" },
  date: { label: "Date", icon: "📅", bg: "#e2f6f6", ac: "#0e8a82", hl: "rgba(14,138,130,.20)", sh: "#a6dcd8", tape: "#8fdad4" },
  concept: { label: "Concept", icon: "🧠", bg: "#eaecff", ac: "#4b47dd", hl: "rgba(75,71,221,.20)", sh: "#c1c5f8", tape: "#b3b8ff" },
  method: { label: "Méthode", icon: "🛠️", bg: "#fff6d6", ac: "#a86a00", hl: "rgba(168,106,0,.20)", sh: "#efdb96", tape: "#ffe08a" },
};

const FALLBACK_THEME = THEMES.notion;

// La plupart des sections sont de type "notion" : on fait alterner les couleurs pour une fiche vivante,
// tout en gardant une couleur fixe pour les types qui ont un sens visuel (formule, piège, exemple...).
const NOTION_ROTATION = [THEMES.notion, THEMES.definition, THEMES.example, THEMES.concept, THEMES.date, THEMES.method];

function pickTheme(type: string, notionIndex: number): Theme {
  const base = THEMES[type] ?? FALLBACK_THEME;
  if (type !== "notion") return base;
  return { ...NOTION_ROTATION[notionIndex % NOTION_ROTATION.length], label: base.label, icon: base.icon };
}

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

// Le modèle écrit parfois une énumération sur une seule ligne ("1. ... 2. ... 3. ...") : on la
// transforme en vraie liste plutôt qu'en paragraphe compact.
function splitInlineNumbering(line: string): string[] {
  if (!/^\d{1,2}[.)]\s/.test(line)) return [line];
  const parts = line.split(/\s(?=\d{1,2}[.)]\s)/);
  return parts.length >= 3 ? parts.map((part) => `- ${part.replace(/^\d{1,2}[.)]\s+/, "")}`) : [line];
}

function renderContent(section: ApiSheetSection): string {
  const lines = section.content.split("\n").flatMap((l) => splitInlineNumbering(l.trim()));
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
// une fiche dense tient sur peu de pages.
function baseFontPt(totalChars: number): number {
  if (totalChars < 500) return 13;
  if (totalChars < 1000) return 11.5;
  if (totalChars < 1800) return 10.5;
  if (totalChars < 2800) return 9.5;
  if (totalChars < 4500) return 8.6;
  if (totalChars < 6500) return 8;
  return 7.4;
}

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Kalam:wght@400;700&family=Nunito:wght@400;600;700;800&display=swap";

const WAVE_UNDERLINE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='8'><path d='M0 4 Q5.5 0 11 4 T22 4' fill='none' stroke='%23ffb703' stroke-width='2.4' stroke-linecap='round'/></svg>";

export function buildSheetHtml(sheet: ApiSheetDetail, orientation: Orientation): string {
  const totalChars = sheet.sections.reduce((n, s) => n + s.content.length + (s.title?.length ?? 0), 0);
  const fontPt = baseFontPt(totalChars);
  const columns = orientation === "landscape" ? 3 : 2;

  const ordered = [...sheet.sections.filter((s) => s.type !== "key_point"), ...sheet.sections.filter((s) => s.type === "key_point")];
  let counter = 0;
  let notionCount = 0;

  const cards = ordered
    .map((section) => {
      const theme = pickTheme(section.type, notionCount);
      if (section.type === "notion") notionCount += 1;
      const isKey = section.type === "key_point";
      if (!isKey) counter += 1;
      const heading = section.title ?? theme.label;
      return `<section class="card${isKey ? " key" : ""}" style="--bg:${theme.bg};--ac:${theme.ac};--hl:${theme.hl};--sh:${theme.sh};--tape:${theme.tape}">
  <div class="tag"><span class="ico">${theme.icon}</span>${esc(theme.label)}</div>
  <h2>${isKey ? "" : `<span class="num">${counter}</span>`}<span class="ttl">${esc(heading)}</span></h2>
  <div class="body">${renderContent(section)}</div>
</section>`;
    })
    .join("\n");

  const meta = [sheet.subjectName, sheet.chapter].filter(Boolean).join(" · ");
  const date = new Date(sheet.createdAt).toLocaleDateString("fr-FR");

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>${esc(sheet.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS_URL}">
<style>
  @page { size: A4 ${orientation}; margin: 8mm; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; padding: 8mm; color: #262633;
    background-color: #fffcf2;
    background-image: radial-gradient(#e6dfca 0.55px, transparent 0.8px);
    background-size: 4mm 4mm;
    font-family: "Nunito","Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;
    font-size: ${fontPt}pt; line-height: 1.4; }
  @media print { body { padding: 0; } }

  header { position: relative; display: flex; align-items: center; gap: 6mm; padding: 5mm 7mm 5.5mm; margin-bottom: 6mm;
    background: linear-gradient(120deg,#dfeaff,#efe6ff 60%,#ffe9f1);
    border: 0.7mm solid #23306b; border-radius: 6mm 4mm 7mm 3.5mm / 4mm 7mm 3.5mm 6mm;
    box-shadow: 1.6mm 1.6mm 0 #c3d1ff; }
  header .titles { flex: 1; min-width: 0; }
  header h1 { display: inline-block; margin: 0; padding-bottom: 2.4mm; font-family: "Caveat","Kalam","Segoe Print",cursive;
    font-size: 3.1em; font-weight: 700; line-height: 1; letter-spacing: .005em; color: #23306b;
    background: url("${WAVE_UNDERLINE}") repeat-x left bottom; }
  header .meta { margin-top: 1.6mm; font-family: "Kalam","Segoe Print",cursive; font-size: 1em; font-weight: 700; color: #6a45e8; }
  header .meta::before { content: "✎ "; }
  header .note { position: relative; flex: 0 0 33%; padding: 3.5mm 4mm 3mm; transform: rotate(2deg);
    background: #fff4a8; border-radius: 1mm 1mm 5mm 1mm; box-shadow: 1mm 1.4mm 2mm rgba(0,0,0,.18);
    font-family: "Caveat","Kalam",cursive; font-size: 1.32em; line-height: 1.15; color: #4a3f10; }
  header .note::before { content: ""; position: absolute; top: -2.6mm; left: 50%; width: 16mm; height: 5mm; margin-left: -8mm;
    background: rgba(255,143,163,.75); transform: rotate(-4deg); }

  .cards { column-count: ${columns}; column-gap: 6mm; }
  .card { position: relative; break-inside: avoid; page-break-inside: avoid; margin: 3mm 0 6.5mm; padding: 4mm 4.2mm 3.6mm;
    background: var(--bg); border: 0.55mm solid var(--ac);
    border-radius: 4.5mm 3mm 5mm 3.2mm / 3.2mm 5mm 3mm 4.5mm; box-shadow: 1.4mm 1.4mm 0 var(--sh); }
  .card:nth-child(3n+2) { border-radius: 3mm 5mm 3.4mm 5mm / 5mm 3mm 5mm 3.4mm; }
  .card:nth-child(3n) { border-radius: 5mm 3.6mm 3mm 4.6mm / 3.6mm 4.6mm 5mm 3mm; }
  .card:nth-child(odd) { transform: rotate(-.35deg); }
  .card:nth-child(even) { transform: rotate(.3deg); }
  .card::before { content: ""; position: absolute; top: -2.5mm; left: 50%; width: 15mm; height: 4.6mm; margin-left: -7.5mm;
    background: var(--tape); opacity: .8; transform: rotate(-3deg); border-radius: .4mm; }
  .card:nth-child(even)::before { transform: rotate(3.5deg); left: 38%; }

  .tag { font-size: .62em; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--ac); opacity: .9; }
  .ico { display: inline-block; margin-right: 1mm; letter-spacing: 0; font-size: 1.25em; vertical-align: -.08em; }
  .card h2 { display: flex; align-items: center; gap: 2.2mm; margin: 0.8mm 0 2mm; font-family: "Kalam","Segoe Print",cursive;
    font-size: 1.28em; font-weight: 700; line-height: 1.15; color: var(--ac); }
  .ttl { background: linear-gradient(transparent 58%, var(--hl) 58%); padding: 0 1mm; margin-left: -1mm; }
  .num { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 1.55em; height: 1.55em;
    border-radius: 58% 42% 55% 45% / 48% 56% 44% 52%; background: var(--ac); color: #fff; font-size: .82em; font-weight: 700; }

  .body p { margin: 0 0 1.4mm; }
  .body p:last-child, .body ul:last-child { margin-bottom: 0; }
  .body ul { margin: 0 0 1.4mm; padding: 0; list-style: none; }
  .body li { position: relative; padding-left: 4.6mm; margin-bottom: 1mm; break-inside: avoid; }
  .body li::before { content: "✦"; position: absolute; left: 0; top: .02em; color: var(--ac); font-size: .85em; }
  .formula { margin: 1.4mm 0; padding: 2mm 2.6mm; text-align: center; background: #fff;
    border: 0.4mm dashed var(--ac); border-radius: 3mm 2mm 3.2mm 2mm / 2mm 3.2mm 2mm 3mm;
    font-family: "Cambria Math","STIX Two Math","Times New Roman",serif; font-size: 1.1em; font-style: italic; overflow-wrap: anywhere; }

  .card.key { column-span: all; margin: 4mm 1.5mm 4mm; padding: 4.5mm 6mm 4.5mm; transform: rotate(-.25deg);
    border: 0.7mm dashed var(--ac); box-shadow: 1.6mm 1.6mm 0 var(--sh); }
  .card.key::before { background: rgba(255,120,150,.7); width: 22mm; margin-left: -11mm; left: 50%; }
  .card.key .tag { display: none; }
  .card.key h2 { font-family: "Caveat","Kalam",cursive; font-size: 1.9em; margin-bottom: 2.4mm; }
  .card.key h2::before { content: "❤"; color: var(--ac); font-size: .8em; }
  .card.key .ttl { background: linear-gradient(transparent 55%, rgba(255,214,0,.55) 55%); }
  .card.key .body ul { column-count: ${columns === 3 ? 3 : 2}; column-gap: 7mm; }

  footer { display: flex; align-items: center; justify-content: space-between; margin-top: 2mm; padding-top: 1.6mm;
    border-top: 0.35mm dashed #b9b29a; font-size: .72em; color: #8a8672; }
  footer .brand { font-family: "Caveat",cursive; font-size: 1.9em; font-weight: 700; line-height: 1; color: #6d4aff; }
</style></head>
<body>
<header>
  <div class="titles"><h1>${esc(sheet.title)}</h1>${meta ? `<div class="meta">${esc(meta)}</div>` : ""}</div>
  ${sheet.summary ? `<div class="note">${esc(sheet.summary)}</div>` : ""}
</header>
<main class="cards">
${cards}
</main>
<footer><span><span class="brand">skoolz</span> · fiche de révision</span><span>${esc(date)}</span></footer>
</body></html>`;
}

// Ajuste la taille du texte pour que la fiche remplisse un nombre entier de pages A4 :
// une fiche courte est agrandie, une fiche qui déborde à peine d'une page est resserrée
// (jusqu'à -20 %) pour éviter une dernière page presque vide. Ne dépasse jamais la cible.
export function fitSheetToPage(doc: Document, orientation: Orientation): void {
  const header = doc.querySelector("header");
  const footer = doc.querySelector("footer");
  if (!header || !footer) return;

  const usable = A4_PX[orientation].h - 61; // marges @page de 8 mm en haut et en bas
  const measure = () => footer.getBoundingClientRect().bottom - header.getBoundingClientRect().top;
  const body = doc.body;
  const start = parseFloat(doc.defaultView?.getComputedStyle(body).fontSize ?? "14");
  const minSize = start * 0.8;
  const maxSize = start * 1.6;

  const initial = measure();
  const pages = Math.max(1, Math.ceil(initial / usable));
  const targetPages = pages > 1 && initial <= (pages - 1) * usable * 1.22 ? pages - 1 : pages;
  const target = targetPages * usable * 0.97;

  let size = start;
  for (let i = 0; i < 10; i++) {
    const h = measure();
    const ratio = target / h;
    if (Math.abs(1 - ratio) < 0.015) break;
    const next = Math.min(Math.max(size * Math.sqrt(ratio), minSize), maxSize);
    if (next === size) break;
    size = next;
    body.style.fontSize = `${size}px`;
  }
  while (measure() > targetPages * usable && size > minSize) {
    size = Math.max(minSize, size * 0.97);
    body.style.fontSize = `${size}px`;
  }
}
