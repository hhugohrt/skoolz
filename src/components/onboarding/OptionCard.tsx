interface OptionCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionCard({ title, description, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col items-start rounded-[14px] border px-5 py-4 text-left transition-colors ${
        selected
          ? "border-purple bg-purple/[0.06]"
          : "border-border bg-white hover:border-purple/40 hover:bg-purple/[0.02]"
      }`}
    >
      <span className="text-[16px] font-semibold text-text">{title}</span>
      {description && <span className="mt-0.5 text-[14px] text-text-secondary">{description}</span>}
    </button>
  );
}
