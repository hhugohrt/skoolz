import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";
import { usePageMeta } from "@/lib/usePageMeta";
import { faqJsonLd, seoPageBySlug, type SeoPage } from "@/seo/data";

// Page de contenu référencée : un guide sur les fiches de révision. Le même contenu est pré-rendu en HTML statique au build.
export default function Guide({ page }: { page: SeoPage }) {
  usePageMeta({ title: page.title, description: page.description, indexable: true, path: `/${page.slug}` });

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "guide-jsonld";
    script.text = JSON.stringify(faqJsonLd(page));
    document.head.appendChild(script);
    return () => script.remove();
  }, [page]);

  const related = page.related.map((slug) => seoPageBySlug(slug)).filter((p): p is SeoPage => Boolean(p));

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <BackgroundBlobs />
      <div className="relative mx-auto flex min-h-screen max-w-[820px] flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between gap-3">
          <Logo />
          <Link to="/signup" className="rounded-full bg-purple px-5 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90">
            Créer ma fiche
          </Link>
        </header>

        <main className="py-10">
          <nav aria-label="Fil d'Ariane" className="text-[13px] text-text-secondary">
            <Link to="/" className="hover:text-text">Skoolz</Link> <span aria-hidden>›</span> {page.label}
          </nav>
          <h1 className="mt-3 font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.01em] text-text sm:text-[42px]">{page.h1}</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-text-secondary">{page.intro}</p>

          <Link
            to="/signup"
            className="mt-6 inline-flex h-[52px] items-center gap-2 rounded-[14px] bg-purple px-6 text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Générer ma fiche de révision <ArrowRight className="h-5 w-5" />
          </Link>

          {page.blocks.map((block) => (
            <section key={block.h2} className="mt-10">
              <h2 className="font-display text-[24px] font-bold text-text sm:text-[28px]">{block.h2}</h2>
              {block.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-[16px] leading-relaxed text-text-secondary">
                  {paragraph}
                </p>
              ))}
              {block.bullets && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[16px] leading-relaxed text-text-secondary">
                  {block.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {block.steps && (
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-[16px] leading-relaxed text-text-secondary">
                  {block.steps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              )}
            </section>
          ))}

          <section className="mt-12" aria-labelledby="faq-title">
            <h2 id="faq-title" className="font-display text-[24px] font-bold text-text sm:text-[28px]">
              Questions fréquentes
            </h2>
            <dl className="mt-4 space-y-5">
              {page.faq.map((item) => (
                <div key={item.q}>
                  <dt className="text-[16px] font-semibold text-text">{item.q}</dt>
                  <dd className="mt-1 text-[16px] leading-relaxed text-text-secondary">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-12 rounded-[20px] border border-border/60 bg-white p-6 text-center">
            <p className="font-display text-[22px] font-bold text-text">Ta fiche de révision en quelques secondes</p>
            <p className="mt-1 text-[15px] text-text-secondary">Importe ton cours, Skoolz s'occupe du reste.</p>
            <Link to="/signup" className="mt-4 inline-flex h-12 items-center gap-2 rounded-[14px] bg-purple px-6 text-[15px] font-semibold text-white">
              Commencer avec Skoolz <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          {related.length > 0 && (
            <nav className="mt-10" aria-label="Guides liés">
              <h2 className="font-display text-[20px] font-bold text-text">À lire aussi</h2>
              <ul className="mt-3 space-y-2">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link to={`/${item.slug}`} className="text-[16px] font-semibold text-purple hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </main>

        <footer className="flex flex-wrap justify-center gap-x-5 gap-y-1 border-t border-border/60 py-6 text-[13px] text-text-secondary">
          <Link to="/mentions-legales" className="hover:text-text">Mentions légales</Link>
          <Link to="/cgu" className="hover:text-text">CGU</Link>
          <Link to="/confidentialite" className="hover:text-text">Confidentialité</Link>
        </footer>
      </div>
    </div>
  );
}
