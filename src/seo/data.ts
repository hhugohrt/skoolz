import pages from "./pages.json";

export interface SeoBlock {
  h2: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
}

export interface SeoPage {
  slug: string;
  label: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  blocks: SeoBlock[];
  faq: { q: string; a: string }[];
  related: string[];
}

export const SEO_PAGES = pages as SeoPage[];

export function seoPageBySlug(slug: string): SeoPage | undefined {
  return SEO_PAGES.find((page) => page.slug === slug);
}

// Données structurées : questions/réponses visibles sur la page (FAQPage).
export function faqJsonLd(page: SeoPage) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
