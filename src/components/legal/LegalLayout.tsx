import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/layout/Footer";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";
import { LEGAL, isLegalComplete } from "@/lib/legal";
import { usePageMeta } from "@/lib/usePageMeta";

interface LegalLayoutProps {
  title: string;
  path: string;
  children: ReactNode;
}

// Valeur légale à compléter : bien visible tant qu'elle est vide, pour ne jamais publier un trou.
export function LegalField({ value }: { value: string }) {
  return value.trim().length > 0 ? (
    <>{value}</>
  ) : (
    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[13px] font-semibold text-red-600">[À compléter]</span>
  );
}

export function LegalSection({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-8 scroll-mt-24">
      <h2 className="font-display text-[20px] font-bold text-text sm:text-[22px]">{title}</h2>
      <div className="mt-2 flex flex-col gap-3 text-[15px] leading-[1.7] text-text-secondary [&_a]:text-purple [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-text">
        {children}
      </div>
    </section>
  );
}

export function LegalLayout({ title, path, children }: LegalLayoutProps) {
  usePageMeta({
    title: `${title} — Skoolz`,
    indexable: isLegalComplete(),
    path,
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <BackgroundBlobs />
      <div className="relative mx-auto flex min-h-screen max-w-[1100px] flex-col px-5 py-5 sm:px-8 xl:py-6">
        <header className="flex items-center justify-between gap-3">
          <Logo />
          <Link
            to="/"
            className="rounded-full bg-purple/[0.09] px-4 py-2 text-[14px] font-semibold text-text transition-colors hover:bg-purple/[0.15]"
          >
            Retour à l&rsquo;accueil
          </Link>
        </header>

        <main className="mx-auto w-full max-w-[820px] flex-1 py-10 sm:py-14">
          <h1 className="font-display text-[30px] font-bold text-text sm:text-[38px]">{title}</h1>
          <p className="mt-2 text-[14px] text-text-secondary">Dernière mise à jour : {LEGAL.lastUpdated}</p>
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}
