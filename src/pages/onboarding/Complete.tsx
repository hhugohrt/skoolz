import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { Mascot } from "@/components/Mascot";
import { useOnboarding } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { api, type ApiSubject } from "@/lib/api";

const LEVEL_LABELS: Record<string, string> = {
  "3e": "3e",
  seconde: "Seconde",
  premiere: "Première",
  terminale: "Terminale",
  superieur: "Études supérieures",
};

export default function OnboardingComplete() {
  const navigate = useNavigate();
  const { token, setUser } = useAuth();
  const { level, subjectIds } = useOnboarding();
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listSubjects(token!).then(({ subjects }) => setSubjects(subjects));
  }, [token]);

  const selectedNames = subjects.filter((s) => subjectIds.includes(s.id)).map((s) => s.name);

  async function handleFinish() {
    if (!level) {
      navigate("/onboarding/level");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { user } = await api.submitOnboarding(token!, { level, subjectIds, theme: "auto" });
      setUser(user);
      navigate("/app");
    } catch {
      setError("Impossible d'enregistrer tes préférences. Réessaie.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="text-center">
      <Mascot className="mx-auto h-[120px] w-[175px]" />

      <h1 className="font-display mt-4 text-[26px] font-bold text-text sm:text-[30px]">Bienvenue dans Skoolz.</h1>

      <div className="mt-6 flex flex-col gap-3 rounded-[14px] border border-border bg-surface-2/60 p-5 text-left">
        <div className="flex justify-between text-[15px]">
          <span className="text-text-secondary">Niveau</span>
          <span className="font-semibold text-text">{level ? LEVEL_LABELS[level] : "—"}</span>
        </div>
        <div className="flex justify-between text-[15px]">
          <span className="text-text-secondary">Matières</span>
          <span className="max-w-[280px] text-right font-semibold text-text">
            {selectedNames.length > 0 ? selectedNames.join(", ") : "—"}
          </span>
        </div>
      </div>

      {error && <p className="mt-4 text-[14px] text-red-500">{error}</p>}

      <PrimaryButton
        label={submitting ? "Un instant…" : "Découvrir Skoolz"}
        gradient={false}
        className="mt-8"
        disabled={submitting}
        onClick={handleFinish}
      />
    </div>
  );
}
