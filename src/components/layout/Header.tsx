import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

interface HeaderProps {
  prompt: string;
  ctaLabel: string;
  ctaTo: string;
}

export function Header({ prompt, ctaLabel, ctaTo }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3">
      <Logo />
      <div className="flex items-center gap-2 text-[13px] sm:gap-4 sm:text-[15px]">
        <span className="hidden text-text-secondary md:inline">{prompt}</span>
        <Link
          to={ctaTo}
          className="whitespace-nowrap rounded-full bg-purple/[0.09] px-3.5 py-2 font-semibold text-text transition-colors hover:bg-purple/[0.15] sm:px-5 sm:py-2.5"
        >
          {ctaLabel}
        </Link>
      </div>
    </header>
  );
}
