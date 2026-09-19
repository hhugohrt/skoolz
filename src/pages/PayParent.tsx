import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
  const [alreadyPremium, setAlreadyPremium] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const paid = useSearchParams()[0].get("paid") === "1";

  useEffect(() => {
    api
      .getParentInvite(token ?? "")
      .then((invite) => {
        setFirstName(invite.firstName);
        setAlreadyPremium(invite.alreadyPremium);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Impossible de charger cette page."));
  }, [token]);

  async function pay() {
    setPaying(true);
    setPayError(null);
    try {
      const { url } = await api.createParentCheckout(token ?? "", plan);
      window.location.href = url;
    } catch (err) {
      setPayError(err instanceof ApiError ? err.message : "Impossible de démarrer le paiement pour le moment.");
      setPaying(false);
    }
  }

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
              paid || alreadyPremium ? (
              <>
                <h1 className="font-display text-[24px] font-bold text-text sm:text-[28px]">Merci ! 🎉</h1>
                <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
                  {paid
                    ? `Votre paiement est bien reçu : les fiches de ${firstName} sont en train d'être débloquées.`
                    : `Les fiches de ${firstName} sont déjà débloquées.`}
                </p>
              </>
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
                  onClick={pay}
                  disabled={paying}
                  className="mt-6 flex h-[54px] w-full items-center justify-center gap-2 rounded-[16px] bg-purple text-[16px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
                >
                  {paying && <Loader2 className="h-4 w-4 animate-spin" />}
                  Payer l&rsquo;abonnement
                </button>
                {payError && <p className="mt-3 text-center text-[13px] text-red-500">{payError}</p>}
              </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
