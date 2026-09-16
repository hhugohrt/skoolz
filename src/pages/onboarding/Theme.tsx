import { useNavigate } from "react-router-dom";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { useOnboarding } from "@/context/OnboardingContext";
import type { Theme } from "@/lib/api";

const THEMES: { value: Theme; title: string }[] = [
  { value: "light", title: "Clair" },
  { value: "dark", title: "Sombre" },
  { value: "auto", title: "Automatique" },
];

export default function OnboardingTheme() {
  const navigate = useNavigate();
  const { theme, setTheme } = useOnboarding();

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold text-text sm:text-[30px]">
        Comment veux-tu voir Skoolz ?
      </h1>

      <div className="mt-6 flex flex-col gap-3">
        {THEMES.map((item) => (
          <OptionCard
            key={item.value}
            title={item.title}
            selected={theme === item.value}
            onClick={() => setTheme(item.value)}
          />
        ))}
      </div>

      <PrimaryButton
        label="Continuer"
        gradient={false}
        className="mt-8"
        onClick={() => navigate("/onboarding/complete")}
      />
    </div>
  );
}
