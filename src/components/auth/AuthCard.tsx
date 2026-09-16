import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-[615px] rounded-[20px] border border-border/60 bg-white p-6 shadow-[0_18px_60px_rgba(54,44,120,0.1)] sm:p-10 xl:p-12">
      <h2 className="font-display text-[26px] font-bold leading-tight text-text sm:text-[32px] xl:text-[38px]">{title}</h2>
      <p className="mt-2 text-[15px] text-text-secondary sm:text-[17px]">{subtitle}</p>
      <div className="mt-6 flex flex-col gap-4">{children}</div>
    </div>
  );
}
