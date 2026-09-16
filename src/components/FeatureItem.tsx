import type { LucideIcon } from "lucide-react";

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple/10">
        <Icon className="h-[18px] w-[18px] text-purple" strokeWidth={2.25} />
      </span>
      <div>
        <p className="text-[15px] font-semibold text-text leading-tight sm:text-[17px]">{title}</p>
        <p className="text-[13px] text-text-secondary leading-tight sm:text-[15px]">{description}</p>
      </div>
    </div>
  );
}
