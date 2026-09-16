import type { ReactNode } from "react";

interface SocialButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

export function SocialButton({ icon, label, onClick }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[58px] w-full items-center justify-center gap-3 rounded-[16px] border border-border bg-white text-[16px] font-semibold text-text transition-colors hover:bg-surface-2"
    >
      <span className="h-[20px] w-[20px]">{icon}</span>
      {label}
    </button>
  );
}
