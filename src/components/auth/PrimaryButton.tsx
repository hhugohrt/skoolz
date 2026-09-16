import type { ButtonHTMLAttributes } from "react";
import { ArrowRight } from "lucide-react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  gradient?: boolean;
}

export function PrimaryButton({ label, className, gradient = true, ...props }: PrimaryButtonProps) {
  return (
    <button
      type="submit"
      className={`${gradient ? "bg-cta-gradient" : "bg-purple"} flex h-[66px] w-full items-center justify-center gap-2 rounded-[16px] text-[18px] font-semibold text-white shadow-[0_14px_30px_rgba(109,74,255,0.28)] transition-transform hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100 ${className ?? ""}`}
      {...props}
    >
      {label}
      <ArrowRight className="h-[20px] w-[20px]" strokeWidth={2.25} />
    </button>
  );
}
