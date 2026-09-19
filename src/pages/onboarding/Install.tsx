import { useNavigate } from "react-router-dom";
import { ChevronsDown, Ellipsis, EllipsisVertical, Plus, Share, SquarePlus, SquareArrowUp } from "lucide-react";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { isIos } from "@/lib/device";

const IOS_STEPS = [
  { icon: Ellipsis, title: "Touche les 3 petits points", text: "Le bouton ⋯ en bas à droite de Safari." },
  { icon: Share, title: "Touche « Partager »", text: "Dans le menu qui s'ouvre." },
  { icon: ChevronsDown, title: "Fais défiler vers le bas", text: "Descends dans la liste des options." },
  { icon: SquarePlus, title: "« Sur l'écran d'accueil »", text: "Puis touche « Ajouter » : Skoolz apparaît comme une vraie app." },
];

const ANDROID_STEPS = [
  { icon: EllipsisVertical, title: "Ouvre le menu ⋮", text: "Les trois points en haut à droite de Chrome." },
  { icon: Plus, title: "« Ajouter à l'écran d'accueil »", text: "Ou « Installer l'application » si proposé." },
  { icon: SquareArrowUp, title: "Confirme", text: "Skoolz apparaît sur ton écran comme une vraie app." },
];

export default function OnboardingInstall() {
  const navigate = useNavigate();
  const steps = isIos() ? IOS_STEPS : ANDROID_STEPS;

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold text-text sm:text-[30px]">
        Garde Skoolz sur ton écran d&rsquo;accueil
      </h1>
      <p className="mt-2 text-[15px] text-text-secondary">
        Ouvre-le en un tap, en plein écran, comme une application.
        {isIos() ? " (À faire depuis Safari.)" : ""}
      </p>

      <ol className="mt-6 flex flex-col gap-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex items-start gap-4 rounded-[14px] border border-border bg-surface-2/60 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple text-white">
              <step.icon className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-text">
                {index + 1}. {step.title}
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-text-secondary">{step.text}</span>
            </span>
          </li>
        ))}
      </ol>

      <PrimaryButton
        label="Continuer"
        gradient={false}
        className="mt-8"
        onClick={() => navigate("/onboarding/complete")}
      />
      <button
        type="button"
        onClick={() => navigate("/onboarding/complete")}
        className="mt-3 w-full text-center text-[14px] font-semibold text-text-secondary hover:text-text"
      >
        Plus tard
      </button>
    </div>
  );
}
