import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MarketingHero, type FeatureData } from "@/components/MarketingHero";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";

interface AuthLayoutProps {
  headerPrompt: string;
  headerCtaLabel: string;
  headerCtaTo: string;
  mascotSrc?: string;
  heroHeading?: ReactNode;
  heroSubtitle?: ReactNode;
  heroFeatures?: FeatureData[];
  children: ReactNode;
}

export function AuthLayout({
  headerPrompt,
  headerCtaLabel,
  headerCtaTo,
  mascotSrc,
  heroHeading,
  heroSubtitle,
  heroFeatures,
  children,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <BackgroundBlobs />
      <div className="relative mx-auto flex min-h-screen max-w-[1672px] flex-col px-5 py-5 sm:px-8 md:px-12 xl:px-[88px] xl:py-6">
        <Header prompt={headerPrompt} ctaLabel={headerCtaLabel} ctaTo={headerCtaTo} />

        <div className="flex flex-col items-center gap-10 py-8 xl:flex-1 xl:flex-row xl:items-start xl:justify-between xl:gap-16 xl:py-3 xl:justify-center">
          <MarketingHero
            mascotSrc={mascotSrc}
            heading={heroHeading}
            subtitle={heroSubtitle}
            features={heroFeatures}
          />
          <div className="flex w-full justify-center xl:w-auto xl:justify-end xl:pt-2">{children}</div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
