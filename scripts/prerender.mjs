// Pré-rendu SEO : après « vite build », génère un fichier HTML statique par guide (dist/<slug>.html) avec le titre,
// la description, l'adresse canonique, les données structurées ET le contenu de la page déjà dans le HTML.
// Les moteurs de recherche et les aperçus de partage n'ont donc pas besoin d'exécuter le JavaScript pour lire la page.
// Génère aussi le plan du site (sitemap.xml) à partir de la liste des pages.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const SITE = "https://www.skoolz.club";
const pages = JSON.parse(readFileSync(join(root, "src/seo/pages.json"), "utf8"));
const template = readFileSync(join(dist, "index.html"), "utf8");

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function bodyHtml(page) {
  const related = page.related
    .map((slug) => pages.find((p) => p.slug === slug))
    .filter(Boolean)
    .map((p) => `<li><a href="/${p.slug}">${esc(p.label)}</a></li>`)
    .join("");

  const blocks = page.blocks
    .map((block) => {
      const paragraphs = (block.paragraphs ?? []).map((t) => `<p>${esc(t)}</p>`).join("");
      const bullets = block.bullets ? `<ul>${block.bullets.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "";
      const steps = block.steps ? `<ol>${block.steps.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>` : "";
      return `<section><h2>${esc(block.h2)}</h2>${paragraphs}${bullets}${steps}</section>`;
    })
    .join("");

  const faq = page.faq.map((f) => `<div><dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd></div>`).join("");

  return (
    `<header><a href="/">Skoolz</a> <a href="/signup">Créer ma fiche</a></header>` +
    `<main><nav aria-label="Fil d'Ariane"><a href="/">Skoolz</a> › ${esc(page.label)}</nav>` +
    `<h1>${esc(page.h1)}</h1><p>${esc(page.intro)}</p>` +
    `<p><a href="/signup">Générer ma fiche de révision</a></p>` +
    blocks +
    `<section><h2>Questions fréquentes</h2><dl>${faq}</dl></section>` +
    `<section><p><a href="/signup">Commencer avec Skoolz</a></p></section>` +
    (related ? `<nav aria-label="Guides liés"><h2>À lire aussi</h2><ul>${related}</ul></nav>` : "") +
    `</main><footer><a href="/mentions-legales">Mentions légales</a> <a href="/cgu">CGU</a> <a href="/confidentialite">Confidentialité</a></footer>`
  );
}

function setMeta(html, page) {
  const url = `${SITE}/${page.slug}`;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Skoolz", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: page.label, item: url },
    ],
  };
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`);
  out = out.replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(page.description)}$2`);
  out = out.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  out = out.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  out = out.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(page.title)}$2`);
  out = out.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(page.description)}$2`);
  out = out.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(page.title)}$2`);
  out = out.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(page.description)}$2`);
  out = out.replace("</head>", `<script type="application/ld+json">${JSON.stringify([faqLd, breadcrumbLd])}</script>\n  </head>`);
  // Le contenu statique remplace le message « noscript » et remplit #root ; React le remplace au chargement.
  out = out.replace(/<noscript>[\s\S]*?<\/noscript>\s*/, "");
  out = out.replace('<div id="root"></div>', `<div id="root">${bodyHtml(page)}</div>`);
  return out;
}

for (const page of pages) {
  writeFileSync(join(dist, `${page.slug}.html`), setMeta(template, page));
}

const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${SITE}/`, priority: "1.0" },
  ...pages.map((p) => ({ loc: `${SITE}/${p.slug}`, priority: "0.8" })),
];
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join("\n") +
    `\n</urlset>\n`,
);
console.log(`Pré-rendu : ${pages.length} pages, sitemap de ${urls.length} adresses.`);
