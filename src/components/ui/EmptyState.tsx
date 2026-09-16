import type { ReactNode } from "react";
import { Mascot } from "@/components/Mascot";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-border/60 bg-white px-6 py-14 text-center">
      <Mascot className="h-[110px] w-[160px]" />
      <p className="mt-4 text-[17px] font-semibold text-text">{title}</p>
      {description && <p className="mt-1 max-w-[360px] text-[14px] text-text-secondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
