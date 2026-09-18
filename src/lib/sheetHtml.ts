import type { ApiSheetDetail, ApiSheetSection } from "@/lib/api";
import type { Orientation, SheetStyle } from "@/lib/sheetStyles";

export type { Orientation } from "@/lib/sheetStyles";

// Dimensions A4 en px CSS (96 dpi) : sert à l'aperçu à l'écran.
export const A4_PX = { portrait: { w: 794, h: 1123 }, landscape: { w: 1123, h: 794 } } as const;

// Hauteur utile d'une page A4 une fois les marges @page (8 mm haut et bas) retirées.
const USABLE_H = { portrait: A4_PX.portrait.h - 61, landscape: A4_PX.landscape.h - 61 } as const;

interface Hue {
  ac: string; // titres, bordures, puces
  bg: string; // fond du bloc
  bd: string; // bordure du bloc
  tint: string; // fond des encadrés internes (formules, exemples)
}

// Une couleur par bloc, en rotation, comme sur une fiche faite à la main.
const HUES: Hue[] = [
  { ac: "#c0272d", bg: "#fdecec", bd: "#f2b3b3", tint: "rgba(192,39,45,.10)" },
  { ac: "#1f5fb5", bg: "#e7f1fd", bd: "#b3d1f2", tint: "rgba(31,95,181,.10)" },
  { ac: "#2b8a3e", bg: "#e8f6e9", bd: "#b6dfba", tint: "rgba(43,138,62,.11)" },
  { ac: "#c76d06", bg: "#fff2dd", bd: "#f4cf8c", tint: "rgba(199,109,6,.11)" },
  { ac: "#6a3fb5", bg: "#f0eafb", bd: "#cfbcee", tint: "rgba(106,63,181,.10)" },
  { ac: "#12807a", bg: "#e2f6f4", bd: "#a6dcd7", tint: "rgba(18,128,122,.11)" },
];
const KEY_HUE: Hue = { ac: "#a35a00", bg: "#fff6c8", bd: "#f0d55c", tint: "rgba(163,90,0,.10)" };

const hueStyle = (h: Hue) => `--ac:${h.ac};--bg:${h.bg};--bd:${h.bd};--tint:${h.tint}`;

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

// Mise en forme mathématique légère : x^2 → x², u_n → uₙ, a*b → a × b.
function math(value: string): string {
  const withTimes = value.replace(/(?<=[\w)])\s?\*\s?(?=[\w(])/g, " × ");
  return pretty(withTimes)
    .replace(/\^(\{[^}]+\}|\([^)]*\)|[A-Za-z0-9+\-−]+)/g, (_m, p: string) => `<sup>${p.replace(/^[{(]|[})]$/g, "")}</sup>`)
    .replace(/_(\{[^}]+\}|[A-Za-z0-9]+(?:[+\-−][A-Za-z0-9]+)?)/g, (_m, p: string) => `<sub>${p.replace(/^\{|\}$/g, "")}</sub>`);
}

// Indices et exposants dans le texte courant (u_n+1 → uₙ₊₁, x^2 → x²), sans toucher aux mots.
function soft(value: string): string {
  return pretty(value.replace(/(?<=[\w)])\s?\*\s?(?=[\w(])/g, " × "))
    .replace(/\b([A-Za-z])_(\{[^}]+\}|[A-Za-z0-9]+(?:[+\-−][A-Za-z0-9]+)?)/g, (_m, l: string, p: string) => `${l}<sub>${p.replace(/^\{|\}$/g, "")}</sub>`)
    .replace(/(?<=[\w)])\^(\{[^}]+\}|\([^)]*\)|[A-Za-z0-9]+)/g, (_m, p: string) => `<sup>${p.replace(/^[{(]|[})]$/g, "")}</sup>`);
}

// Une ligne « formule » : une égalité courte, sans phrase.
function isFormulaLike(value: string): boolean {
  if (/\b(si|de|du|des|le|la|les|et|ou|un|une|par|pour|donc|dont|avec|sans|en|est|sont)\b/i.test(value)) return false;
  return /[=≈≠]/.test(value) && value.length <= 80 && (value.match(/\p{L}{5,}/gu) ?? []).length <= 2;
}

// Le modèle écrit parfois une énumération sur une seule ligne ("1. ... 2. ... 3. ...") : on la
// transforme en vraie liste plutôt qu'en paragraphe compact.
function splitInlineNumbering(line: string): string[] {
  if (!/^\d{1,2}[.)]\s/.test(line)) return [line];
  const parts = line.split(/\s(?=\d{1,2}[.)]\s)/);
  return parts.length >= 3 ? parts.map((part) => `- ${part.replace(/^\d{1,2}[.)]\s+/, "")}`) : [line];
}

// « Libellé : valeur » → libellé en gras ; une valeur qui est une formule passe dans un encadré.
function inline(text: string): string {
  const m = text.match(/^(.{2,42}?)\s:\s(.+)$/);
  if (m && isFormulaLike(m[2])) return `<b>${soft(m[1])} :</b><span class="formula">${math(m[2])}</span>`;
  if (m) return `<b>${soft(m[1])} :</b> ${soft(m[2])}`;
  if (isFormulaLike(text)) return `<span class="formula">${math(text)}</span>`;
  return soft(text);
}

function cleanLines(section: ApiSheetSection): string[] {
  return section.content
    .split("\n")
    .flatMap((l) => splitInlineNumbering(l.trim()))
    .filter((l) => l !== "");
}

function renderBody(section: ApiSheetSection): string {
  const lines = cleanLines(section);
  const isFormulaSection = section.type === "formula";
  const out: string[] = [];
  let bullets: string[] = [];
  let steps: string[] = [];

  const flush = () => {
    if (bullets.length > 0) out.push(`<ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`);
    if (steps.length > 0) {
      // Une seule ligne numérotée n'est pas une suite d'étapes : on la garde comme paragraphe.
      out.push(
        steps.length >= 2
          ? `<ol class="steps">${steps.map((s) => `<li>${s}</li>`).join("")}</ol>`
          : `<p>${steps[0]}</p>`,
      );
    }
    bullets = [];
    steps = [];
  };

  for (const line of lines) {
    const bullet = line.match(/^[-•*]\s+(.*)$/);
    const numbered = line.match(/^\d{1,2}[.)]\s+(.*)$/);
    if (bullet) {
      if (steps.length > 0) flush();
      bullets.push(inline(bullet[1]));
    } else if (numbered) {
      if (bullets.length > 0) flush();
      steps.push(inline(numbered[1]));
    } else {
      flush();
      out.push(isFormulaSection && isFormulaLike(line) ? `<div class="formula block">${math(line)}</div>` : `<p>${inline(line)}</p>`);
    }
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

function totalChars(sheet: ApiSheetDetail): number {
  return sheet.sections.reduce((n, s) => n + s.content.length + (s.title?.length ?? 0), 0);
}

// Sections dans l'ordre d'affichage : « À retenir » toujours en dernier.
function orderedSections(sheet: ApiSheetDetail): ApiSheetSection[] {
  return [...sheet.sections.filter((s) => s.type !== "key_point"), ...sheet.sections.filter((s) => s.type === "key_point")];
}

const FONTS_URL = "/fonts/fonts.css";

const BASE_CSS = `
  @page { size: A4 var(--orient); margin: 8mm; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; padding: 8mm; background: #fff; color: #23232c;
    font-family: "Nunito","Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif; line-height: 1.36; }
  @media print { body { padding: 0; } }
  sup, sub { line-height: 0; font-size: .72em; }
  .formula { display: inline-block; margin: .5mm 0; padding: .8mm 2.6mm; background: var(--tint); border-radius: 1.6mm;
    font-family: "Cambria Math","STIX Two Math","Times New Roman",serif; font-style: italic; font-size: 1.06em; overflow-wrap: anywhere; }
  .formula.block { display: block; text-align: center; padding: 1.4mm 2.6mm; margin: 1mm 0; }
  li > .formula { display: block; width: fit-content; max-width: 100%; margin-top: .6mm; }
  .steps { list-style: none; counter-reset: step; margin: 0 0 1.4mm; padding: 0; }
  .body .steps li { counter-increment: step; position: relative; padding-left: 6mm; margin-bottom: 1mm; break-inside: avoid; }
  .body .steps li::before { content: counter(step); left: 0; width: 4.2mm; height: 4.2mm; border-radius: 50%; position: absolute; top: .08em;
    background: var(--ac); color: #fff; font-size: .78em; font-weight: 800; display: flex; align-items: center; justify-content: center; }
  footer { display: flex; align-items: center; justify-content: space-between; margin-top: 2mm; padding-top: 1.4mm;
    border-top: 0.3mm dashed #c9c9d2; font-size: .7em; color: #8a8a96; }
  footer .brand { font-family: "Caveat",cursive; font-size: 1.9em; font-weight: 700; line-height: 1; color: #6d4aff; }
`;

const BLOCK_CSS = `
  header { position: relative; display: flex; align-items: center; gap: 6mm; padding: 3.2mm 6mm 3.6mm; margin-bottom: 4mm;
    background: #e3f0fb; border: 0.55mm solid #16386b; border-radius: 3.2mm; }
  header .titles { flex: 1; min-width: 0; text-align: center; }
  header h1 { margin: 0; font-family: "Caveat","Segoe Print",cursive; font-size: 3em; font-weight: 700; line-height: 1.02; color: #16386b; }
  header .meta { display: inline-block; margin-top: .6mm; padding: 0 5mm 1mm; font-family: "Caveat","Segoe Print",cursive;
    font-size: 1.5em; font-weight: 700; color: #16386b; background: linear-gradient(transparent 55%, #fff27a 55%); }
  header .note { flex: 0 0 26%; padding: 2.6mm 3.4mm; transform: rotate(2.2deg); background: #fff4a8; border-radius: .8mm;
    box-shadow: .8mm 1.2mm 2mm rgba(0,0,0,.16); font-family: "Caveat","Segoe Print",cursive; font-size: 1.22em; line-height: 1.12; color: #4a3f10; }

  .cards { column-count: var(--cols); column-gap: 3.4mm; }
  .card { break-inside: avoid; page-break-inside: avoid; margin: 0 0 3.4mm; padding: 2.6mm 3.4mm 3mm;
    background: var(--bg); border: 0.4mm solid var(--bd); border-radius: 3mm; }
  .card h2 { display: flex; align-items: baseline; gap: 1.6mm; margin: 0 0 1.6mm; font-family: "Barlow Condensed","Arial Narrow",sans-serif;
    font-size: 1.32em; font-weight: 700; line-height: 1.1; letter-spacing: .01em; text-transform: uppercase; color: var(--ac); }
  .card h2 .n { font-size: 1.25em; }
  .body p { margin: 0 0 1.2mm; }
  .body p:last-child, .body ul:last-child, .body ol:last-child { margin-bottom: 0; }
  .body ul { margin: 0 0 1.2mm; padding: 0; list-style: none; }
  .body li { position: relative; padding-left: 4mm; margin-bottom: .9mm; }
  .body li::before { content: ""; position: absolute; left: .2mm; top: .55em; width: 1.9mm; height: 1.9mm; border-radius: 50%; background: var(--ac); }
  .body b { font-weight: 800; }
  .body.t-example { background: rgba(72,92,130,.10); border-radius: 2mm; padding: 1.8mm 2.4mm; }
  .body.t-common_mistake { color: #b3201b; font-weight: 700; }
  .body.t-common_mistake li::before { background: #b3201b; }
  .card.key { border-width: .5mm; }
  .card.key h2::after { content: "♥"; color: #e0294d; font-size: 1.1em; margin-left: 1mm; }
`;

const COMPACT_CSS = `
  header { display: flex; align-items: baseline; justify-content: space-between; gap: 4mm; padding: 1.6mm 4mm; margin-bottom: 2.6mm;
    background: #e3f0fb; border: 0.4mm solid #16386b; border-radius: 2mm; }
  header h1 { margin: 0; font-family: "Caveat","Segoe Print",cursive; font-size: 2.1em; font-weight: 700; line-height: 1; color: #16386b; }
  header .meta { font-family: "Caveat","Segoe Print",cursive; font-size: 1.25em; font-weight: 700; color: #16386b; white-space: nowrap; }
  header .note { display: none; }
  .cards { column-count: var(--cols); column-gap: 2.6mm; }
  .card { break-inside: avoid; page-break-inside: avoid; margin: 0 0 2.4mm; padding: 1.8mm 2.4mm 2mm;
    background: var(--bg); border: 0.25mm solid var(--bd); border-left: 1.3mm solid var(--ac); border-radius: 1.6mm; }
  .card h2 { margin: 0 0 .8mm; font-family: "Barlow Condensed","Arial Narrow",sans-serif; font-size: 1.12em; font-weight: 700;
    line-height: 1.1; text-transform: uppercase; color: var(--ac); }
  .card h2 .n { font-size: 1em; margin-right: 1mm; }
  .body p { margin: 0 0 .7mm; }
  .body p:last-child, .body ul:last-child, .body ol:last-child { margin-bottom: 0; }
  .body ul { margin: 0 0 .7mm; padding: 0; list-style: none; }
  .body li { position: relative; padding-left: 2.8mm; margin-bottom: .4mm; }
  .body li::before { content: ""; position: absolute; left: .1mm; top: .55em; width: 1.3mm; height: 1.3mm; border-radius: 50%; background: var(--ac); }
  .body b { font-weight: 800; }
  .body.t-common_mistake { color: #b3201b; font-weight: 700; }
  .card.key h2::after { content: "♥"; color: #e0294d; margin-left: 1mm; }
  .formula { padding: .3mm 1.6mm; }
  .formula.block { padding: .8mm 1.6mm; margin: .5mm 0; }
`;

const DIAGRAM_CSS = `
  header { display: flex; align-items: center; justify-content: center; gap: 5mm; padding: 2.4mm 6mm; margin-bottom: 5mm;
    background: #e3f0fb; border: 0.5mm solid #16386b; border-radius: 3mm; text-align: center; }
  header .titles { flex: 1; }
  header h1 { margin: 0; font-family: "Caveat","Segoe Print",cursive; font-size: 2.6em; font-weight: 700; line-height: 1; color: #16386b; }
  header .meta { font-family: "Caveat","Segoe Print",cursive; font-size: 1.35em; font-weight: 700; color: #16386b; }
  header .note { display: none; }
  .flow { display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); column-gap: 10mm; row-gap: 10mm; align-items: start; }
  .box { position: relative; break-inside: avoid; border: 0.4mm solid var(--bd); border-radius: 3mm; background: var(--bg); }
  .box h2 { display: flex; align-items: center; gap: 1.8mm; margin: 0; padding: 1.8mm 3mm; background: var(--ac); color: #fff;
    border-radius: 2.6mm 2.6mm 0 0; font-family: "Barlow Condensed","Arial Narrow",sans-serif; font-size: 1.22em; font-weight: 700;
    line-height: 1.1; text-transform: uppercase; }
  .box h2 .n { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 1.5em; height: 1.5em; border-radius: 50%;
    background: #fff; color: var(--ac); font-size: .85em; }
  .box .body { padding: 2mm 3mm 2.4mm; }
  .body p { margin: 0 0 1mm; }
  .body p:last-child, .body ul:last-child, .body ol:last-child { margin-bottom: 0; }
  .body ul { margin: 0 0 1mm; padding: 0; list-style: none; }
  .body li { position: relative; padding-left: 3.6mm; margin-bottom: .7mm; }
  .body li::before { content: ""; position: absolute; left: .2mm; top: .55em; width: 1.7mm; height: 1.7mm; border-radius: 50%; background: var(--ac); }
  .body b { font-weight: 800; }
  .body.t-common_mistake { color: #b3201b; font-weight: 700; }
  .arw { position: absolute; z-index: 2; width: 7.4mm; height: 7.4mm; border-radius: 50%; background: #fff; color: var(--ac);
    border: 0.6mm solid var(--ac); display: flex; align-items: center; justify-content: center; font-size: 1.15em; font-weight: 800; line-height: 1; }
  .arw.r { right: -8.7mm; top: calc(50% - 3.7mm); }
  .arw.l { left: -8.7mm; top: calc(50% - 3.7mm); }
  .arw.d { bottom: -8.7mm; left: calc(50% - 3.7mm); }
  .box.key h2::after { content: "♥"; margin-left: auto; }
`;

const MINDMAP_CSS = `
  .map { position: relative; display: flex; align-items: stretch; gap: 6mm; }
  .col { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-around; gap: 2mm; }
  .item { position: relative; z-index: 1; display: flex; align-items: center; gap: 3mm; }
  .node { flex: none; width: var(--node-w); padding: 1.8mm 2.4mm; border-radius: 3mm; background: var(--ac); color: #fff; text-align: center;
    font-family: "Barlow Condensed","Arial Narrow",sans-serif; font-size: 1.28em; font-weight: 700; line-height: 1.08; text-transform: uppercase; }
  .leaves { flex: 1; min-width: 0; margin: 0; padding: 0; list-style: none; font-size: .86em; line-height: 1.26; }
  .leaves li { position: relative; margin-bottom: .6mm; }
  .col.left .leaves { text-align: right; }
  .col.left .leaves li { padding-right: 3.6mm; }
  .col.right .leaves li { padding-left: 3.6mm; }
  .leaves li::before { content: ""; position: absolute; top: .5em; width: 1.6mm; height: 1.6mm; border-radius: 50%; background: var(--ac); }
  .col.left .leaves li::before { right: 0; }
  .col.right .leaves li::before { left: 0; }
  .leaves li.more { opacity: .6; font-style: italic; }
  .center { flex: none; width: var(--core-w); display: flex; align-items: center; justify-content: center; }
  .core { position: relative; z-index: 2; padding: 5mm 4mm; border-radius: 46% 54% 50% 50% / 52% 48% 52% 48%; text-align: center;
    background: linear-gradient(135deg, #4f8cff, #6d4aff 55%, #a855f7); color: #fff; box-shadow: 0 1.4mm 3mm rgba(109,74,255,.35); }
  .core h1 { margin: 0; font-family: "Caveat","Segoe Print",cursive; font-size: 2.3em; font-weight: 700; line-height: 1; }
  .core .meta { margin-top: 1.4mm; font-family: "Caveat","Segoe Print",cursive; font-size: 1.25em; font-weight: 700; opacity: .92; }
  svg.links { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; overflow: visible; }
`;

function banner(sheet: ApiSheetDetail): string {
  const meta = [sheet.subjectName, sheet.chapter].filter(Boolean).join(" – ");
  return `<header>
  <div class="titles"><h1>${esc(sheet.title)}</h1>${meta ? `<div class="meta">${esc(meta)}</div>` : ""}</div>
  ${sheet.summary ? `<div class="note">${esc(sheet.summary)}</div>` : ""}
</header>`;
}

function footer(sheet: ApiSheetDetail): string {
  const date = new Date(sheet.createdAt).toLocaleDateString("fr-FR");
  return `<footer><span><span class="brand">skoolz</span> · fiche de révision</span><span>${esc(date)}</span></footer>`;
}

function documentShell(
  sheet: ApiSheetDetail,
  orientation: Orientation,
  style: SheetStyle,
  css: string,
  vars: string,
  body: string,
  bodyStyle = "",
): string {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>${esc(sheet.title)}</title>
<link rel="stylesheet" href="${FONTS_URL}">
<style>
  :root { --orient: ${orientation}; ${vars} }
  ${BASE_CSS}
  ${css}
</style></head>
<body data-style="${style}"${bodyStyle ? ` style="${bodyStyle}"` : ""}>
${body}
</body></html>`;
}

// --- Fiche colorée & fiche compactée : blocs en colonnes -------------------------------------------

function blocks(sheet: ApiSheetDetail, style: "colorful" | "compact", orientation: Orientation): string {
  const compact = style === "compact";
  const chars = totalChars(sheet);
  const fontPt = Math.max(6.6, baseFontPt(chars) - (compact ? 1.2 : 0));
  const cols = compact
    ? orientation === "landscape" ? 4 : 3
    : orientation === "landscape" ? (chars > 2600 ? 4 : 3) : chars > 2400 ? 3 : 2;

  let n = 0;
  const cards = orderedSections(sheet)
    .map((section) => {
      const key = section.type === "key_point";
      if (!key) n += 1;
      const hue = key ? KEY_HUE : HUES[(n - 1) % HUES.length];
      const title = section.title ?? (key ? "À savoir par cœur" : "");
      return `<section class="card${key ? " key" : ""}" style="${hueStyle(hue)}">
  <h2>${key ? "" : `<span class="n">${n}.</span>`}<span class="t">${esc(title)}</span></h2>
  <div class="body t-${section.type}">${renderBody(section)}</div>
</section>`;
    })
    .join("\n");

  return documentShell(
    sheet,
    orientation,
    style,
    compact ? COMPACT_CSS : BLOCK_CSS,
    `--cols:${cols};`,
    `${banner(sheet)}\n<main class="cards">\n${cards}\n</main>\n${footer(sheet)}`,
    `font-size:${fontPt}pt`,
  );
}

// --- Schéma : étapes reliées par des flèches (parcours en serpentin) -------------------------------

function diagram(sheet: ApiSheetDetail, orientation: Orientation): string {
  const sections = orderedSections(sheet);
  const baseCols = orientation === "landscape" ? 4 : 3;
  const cols = Math.max(2, Math.min(baseCols, sections.length));
  const fontPt = baseFontPt(totalChars(sheet)) - 0.6;

  let n = 0;
  const boxes = sections
    .map((section, i) => {
      const key = section.type === "key_point";
      if (!key) n += 1;
      const hue = key ? KEY_HUE : HUES[(n - 1) % HUES.length];
      const row = Math.floor(i / cols);
      const c = i % cols;
      const gridCol = row % 2 === 0 ? c + 1 : cols - c;
      const last = i === sections.length - 1;
      const arrow = last ? "" : c < cols - 1 ? (row % 2 === 0 ? "r" : "l") : "d";
      const glyph = arrow === "r" ? "→" : arrow === "l" ? "←" : "↓";
      const title = section.title ?? (key ? "À retenir" : "");
      return `<section class="box${key ? " key" : ""}" style="${hueStyle(hue)};grid-column:${gridCol};grid-row:${row + 1}">
  <h2>${key ? "" : `<span class="n">${n}</span>`}<span>${esc(title)}</span></h2>
  <div class="body t-${section.type}">${renderBody(section)}</div>
  ${arrow ? `<span class="arw ${arrow}">${glyph}</span>` : ""}
</section>`;
    })
    .join("\n");

  return documentShell(
    sheet,
    orientation,
    "diagram",
    DIAGRAM_CSS,
    `--cols:${cols};`,
    `${banner(sheet)}\n<main class="flow">\n${boxes}\n</main>\n${footer(sheet)}`,
    `font-size:${fontPt}pt`,
  );
}

// --- Carte mentale : titre au centre, une branche par section, points en feuilles ------------------

const shorten = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

function leafText(line: string): string {
  const plain = line.replace(/^[-•*]\s+/, "").replace(/^\d{1,2}[.)]\s+/, "");
  return shorten(plain, 78);
}

function mindmap(sheet: ApiSheetDetail, orientation: Orientation): string {
  const sections = orderedSections(sheet);
  const mapH = USABLE_H[orientation] - 46;
  const perSide = Math.ceil(sections.length / 2);
  const fontPx = orientation === "landscape" ? 13.2 : 12.4;
  const budget = mapH / Math.max(1, perSide);
  const maxLeaves = Math.max(1, Math.min(7, Math.floor((budget - 40) / (fontPx * 1.36 * 0.86))));

  let n = 0;
  const side = { left: [] as string[], right: [] as string[] };
  sections.forEach((section, i) => {
    const key = section.type === "key_point";
    if (!key) n += 1;
    const hue = key ? KEY_HUE : HUES[(n - 1) % HUES.length];
    const lines = cleanLines(section);
    const shown = lines.length > maxLeaves ? lines.slice(0, maxLeaves - 1) : lines;
    const hidden = lines.length - shown.length;
    const leaves = [
      ...shown.map((l) => `<li>${soft(leafText(l))}</li>`),
      ...(hidden > 0 ? [`<li class="more">+ ${hidden} autre${hidden > 1 ? "s" : ""} point${hidden > 1 ? "s" : ""}</li>`] : []),
    ].join("");
    const title = esc(shorten(section.title ?? (key ? "À retenir" : "Notion"), 42));
    const isRight = i % 2 === 0;
    const node = `<div class="node" data-side="${isRight ? "right" : "left"}">${title}</div>`;
    const list = `<ul class="leaves">${leaves}</ul>`;
    const item = `<div class="item" style="${hueStyle(hue)}">${isRight ? node + list : list + node}</div>`;
    (isRight ? side.right : side.left).push(item);
  });

  const meta = [sheet.subjectName, sheet.chapter].filter(Boolean).join(" – ");
  const nodeW = orientation === "landscape" ? "36mm" : "27mm";
  const coreW = orientation === "landscape" ? "58mm" : "40mm";

  return documentShell(
    sheet,
    orientation,
    "mindmap",
    MINDMAP_CSS,
    `--node-w:${nodeW};--core-w:${coreW};`,
    `<main class="map" style="height:${mapH}px;font-size:${fontPx}px">
  <div class="col left">${side.left.join("")}</div>
  <div class="center"><div class="core"><h1>${esc(sheet.title)}</h1>${meta ? `<div class="meta">${esc(meta)}</div>` : ""}</div></div>
  <div class="col right">${side.right.join("")}</div>
</main>
${footer(sheet)}`,
  );
}

export function buildSheetHtml(sheet: ApiSheetDetail, orientation: Orientation, style: SheetStyle = "colorful"): string {
  if (style === "mindmap") return mindmap(sheet, orientation);
  if (style === "diagram") return diagram(sheet, orientation);
  return blocks(sheet, style, orientation);
}

// --- Ajustements faits une fois le document affiché (polices chargées) -----------------------------

// Ajuste la taille du texte pour que la fiche remplisse un nombre entier de pages A4 :
// une fiche courte est agrandie, une fiche qui déborde à peine d'une page est resserrée
// (jusqu'à -20 %) pour éviter une dernière page presque vide. Ne dépasse jamais la cible.
export function fitSheetToPage(doc: Document, orientation: Orientation, maxGrow = 1.6): void {
  const first = doc.body.firstElementChild;
  const footerEl = doc.querySelector("footer");
  if (!first || !footerEl) return;

  const usable = USABLE_H[orientation];
  const measure = () => footerEl.getBoundingClientRect().bottom - first.getBoundingClientRect().top;
  const body = doc.body;
  const start = parseFloat(doc.defaultView?.getComputedStyle(body).fontSize ?? "14");
  const minSize = start * 0.8;
  const maxSize = start * maxGrow;

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

// Trace les liens courbes entre le noyau central et chaque branche (positions mesurées dans le DOM).
export function drawMindmapLinks(doc: Document): void {
  const map = doc.querySelector<HTMLElement>(".map");
  const core = doc.querySelector<HTMLElement>(".core");
  if (!map || !core) return;

  map.querySelector("svg.links")?.remove();
  const ns = "http://www.w3.org/2000/svg";
  const svg = doc.createElementNS(ns, "svg");
  svg.setAttribute("class", "links");

  const m = map.getBoundingClientRect();
  const c = core.getBoundingClientRect();
  const cy = c.top - m.top + c.height / 2;

  map.querySelectorAll<HTMLElement>(".node").forEach((node) => {
    const r = node.getBoundingClientRect();
    const toRight = node.dataset.side === "right";
    const x1 = (toRight ? c.right : c.left) - m.left;
    const x2 = (toRight ? r.left : r.right) - m.left;
    const y2 = r.top - m.top + r.height / 2;
    const mid = x1 + (x2 - x1) / 2;
    const path = doc.createElementNS(ns, "path");
    path.setAttribute("d", `M ${x1} ${cy} C ${mid} ${cy}, ${mid} ${y2}, ${x2} ${y2}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", doc.defaultView?.getComputedStyle(node).backgroundColor ?? "#6d4aff");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("stroke-linecap", "round");
    svg.appendChild(path);
  });

  map.insertBefore(svg, map.firstChild);
}

export function finalizeSheetDocument(doc: Document, style: SheetStyle, orientation: Orientation): void {
  if (style === "mindmap") drawMindmapLinks(doc);
  else fitSheetToPage(doc, orientation, style === "compact" ? 1.2 : 1.6);
}
