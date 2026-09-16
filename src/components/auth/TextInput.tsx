import { useId, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  isPassword?: boolean;
}

export function TextInput({ label, icon: Icon, isPassword, id, ...props }: TextInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-[16px] font-semibold text-text">
        {label}
      </label>
      <div className="relative flex items-center">
        <Icon className="pointer-events-none absolute left-4 h-[18px] w-[18px] text-text-secondary" strokeWidth={2} />
        <input
          id={inputId}
          type={isPassword ? (visible ? "text" : "password") : props.type ?? "text"}
          className="h-[58px] w-full rounded-[14px] border border-border bg-white pl-11 pr-11 text-[17px] text-text placeholder:text-text-secondary/70 outline-none transition-colors focus:border-purple focus:ring-4 focus:ring-purple/10"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-4 text-text-secondary transition-colors hover:text-text"
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {visible ? <EyeOff className="h-[18px] w-[18px]" strokeWidth={2} /> : <Eye className="h-[18px] w-[18px]" strokeWidth={2} />}
          </button>
        )}
      </div>
    </div>
  );
}
