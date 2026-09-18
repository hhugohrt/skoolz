import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";
import { PlanPicker } from "@/components/billing/PlanPicker";
import { api, ApiError } from "@/lib/api";
import type { Plan } from "@/lib/pricing";
import { usePageMeta } from "@/lib/usePageMeta";

// Page publique ouverte par le parent depuis le lien envoyé par l'élève.
export default function PayParent() {
  usePageMeta({ title: "Abonnement Skoolz", path: "/pay" });
  const { token } = useParams<{ token: string }>();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan["id"]>("yearly");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    api
      .getParentInvite(token ?? "")
      .then(({ firstName }) => setFirstName(firstName))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Impossible de charger cette page."));
  }, [token]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <BackgroundBlobs />
      <div className="relative mx-auto flex min-h-screen max-w-[560px] flex-col px-5 py-8">
        <Logo />
        <div className="flex flex-1 items-center py-8">
          <div className="w-full rounded-[20px] border border-border/60 bg-white p-6 shadow-[0_18px_60px_rgba(54,44,120,0.1)] sm:p-9">
            {error ? (
              <p className="text-[15px] text-text-secondary">{error}</p>
            ) : firstName === null ? (
              <p className="flex items-center gap-2 text-[15px] text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
              </p>
            ) : (
              <>
                <h1 className="font-display text-[24px] font-bold text-text sm:text-[28px]">
                  {firstName} aimerait votre aide
                </h1>
                <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
                  Skoolz transforme les cours de {firstName} en fiches de révision claires, colorées et imprimables.
                  Pour les débloquer, {firstName} a besoin d&rsquo;un abonnement.
                </p>

                <div className="mt-6">
                  <PlanPicker value={plan} onChange={setPlan} />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNotice("Le paiement en ligne sera disponible très bientôt. Revenez sur ce lien dans quelques jours.")
                  }
                  className="mt-6 h-[54px] w-full rounded-[16px] bg-purple text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Payer l&rsquo;abonnement
                </button>
                {notice && <p className="mt-3 text-center text-[13px] text-text-secondary">{notice}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
