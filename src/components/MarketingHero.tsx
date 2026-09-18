import type { ReactNode } from "react";
import { BarChart3, Calendar, Users, type LucideIcon } from "lucide-react";
import { FeatureItem } from "@/components/FeatureItem";
import { Mascot } from "@/components/Mascot";

export interface FeatureData {
  icon: LucideIcon;
  title: string;
  description: string;
}

const defaultFeatures: FeatureData[] = [
  {
    icon: BarChart3,
    title: "Suis ta progression",
    description: "Des outils simples pour aller plus loin.",
  },
  {
    icon: Calendar,
    title: "Organise tes révisions",
    description: "Tout au même endroit.",
  },
  {
    icon: Users,
    title: "Rejoins une communauté",
    description: "Une app pensée pour les élèves.",
  },
];

interface MarketingHeroProps {
  heading?: ReactNode;
  subtitle?: ReactNode;
  features?: FeatureData[];
  mascotSrc?: string;
}

export function MarketingHero({ heading, subtitle, features = defaultFeatures, mascotSrc }: MarketingHeroProps) {
  return (
    <div className="flex w-full flex-col pt-2 xl:max-w-[740px]">
      <h1 className="font-display text-[36px] font-extrabold leading-[1.05] tracking-[-0.02em] text-text sm:text-[48px] md:text-[58px] xl:text-[74px] xl:leading-[0.98]">
        {heading ?? (
          <>
            Ton espace d&rsquo;étude,
            <br />
            tout <span className="text-purple">simplement.</span>
          </>
        )}
      </h1>

      <p className="mt-4 max-w-[520px] text-[16px] leading-[1.5] text-text-secondary sm:text-[18px] xl:mt-5 xl:text-[20px]">
        {subtitle ?? (
          <>
            Organise tes cours, révise plus vite
            <br className="hidden sm:block" /> et progresse chaque jour avec Skoolz.
          </>
        )}
      </p>

      <div className="mt-7 flex flex-col gap-3 xl:mt-8">
        {features.map((feature) => (
          <FeatureItem
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>

      <div className="relative mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
        <p className="font-hand -rotate-3 text-[19px] leading-[1.15] text-text-secondary sm:text-[22px]">
          Plus qu&rsquo;une app,
          <br />
          une réussite en plus&nbsp;!
        </p>
        <Mascot
          src={mascotSrc}
          className="h-[150px] w-[218px] sm:ml-auto sm:h-[170px] sm:w-[248px] xl:h-[190px] xl:w-[277px]"
        />
      </div>
    </div>
  );
}
