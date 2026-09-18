import type { ReactNode } from "react";

interface SocialButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function SocialButton({ icon, label, onClick, disabled }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[58px] w-full items-center justify-center gap-3 rounded-[16px] border border-border bg-white text-[16px] font-semibold text-text transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="h-[20px] w-[20px]">{icon}</span>
      {label}
    </button>
  );
}
