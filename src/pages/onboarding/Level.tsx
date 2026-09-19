import { useNavigate } from "react-router-dom";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { useOnboarding } from "@/context/OnboardingContext";
import type { Level } from "@/lib/api";

const LEVELS: { value: Level; title: string; description: string }[] = [
  { value: "6e", title: "6e", description: "Entrée au collège" },
  { value: "5e", title: "5e", description: "Consolider les bases" },
  { value: "4e", title: "4e", description: "Approfondir" },
  { value: "3e", title: "3e", description: "Brevet" },
  { value: "seconde", title: "Seconde", description: "Construire de bonnes bases" },
  { value: "premiere", title: "Première", description: "Bac français, maths et spécialités" },
  { value: "terminale", title: "Terminale", description: "Bac & spécialités" },
  { value: "superieur", title: "Études supérieures", description: "BTS, BUT, Licence, Master…" },
];

export default function OnboardingLevel() {
  const navigate = useNavigate();
  const { level, setLevel } = useOnboarding();

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold text-text sm:text-[30px]">Quel est ton niveau ?</h1>

      <div className="mt-6 flex flex-col gap-3">
        {LEVELS.map((item) => (
          <OptionCard
            key={item.value}
            title={item.title}
            description={item.description}
            selected={level === item.value}
            onClick={() => setLevel(item.value)}
          />
        ))}
      </div>

      <PrimaryButton
        label="Continuer"
        gradient={false}
        className="mt-8"
        disabled={!level}
        onClick={() => navigate("/onboarding/subjects")}
      />
    </div>
  );
}
