import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { PLANS, type Plan } from "@/lib/pricing";
import { CheckoutEmbed } from "@/components/billing/CheckoutEmbed";

// Page de paiement intégrée à Skoolz : /app/checkout?plan=monthly|yearly
export default function Checkout() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planId = params.get("plan") === "monthly" ? "monthly" : "yearly";
  const plan = PLANS.find((p) => p.id === planId) as Plan;
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || user?.isPremium) return;
    setSessionId(null);
    setError(null);
    api
      .createCheckout(token, planId)
      .then(({ sessionId }) => setSessionId(sessionId))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Impossible de démarrer le paiement pour le moment."));
  }, [token, planId, user?.isPremium]);

  if (user?.isPremium) return <Navigate to="/app/courses" replace />;

  return (
    <div className="mx-auto max-w-[560px]">
      <Link to="/app/courses" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-purple hover:underline">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <h1 className="mt-3 font-display text-[26px] font-bold text-text sm:text-[30px]">Débloquer mes fiches</h1>

      <div className="mt-5 flex items-center justify-between rounded-[16px] border border-border/60 bg-white p-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Skoolz Premium · {plan.name}</p>
          <p className="mt-0.5 text-[13px] text-text-secondary">{plan.note}</p>
        </div>
        <p className="text-right text-text">
          <span className="font-display text-[24px] font-bold">{plan.price}</span>{" "}
          <span className="text-[13px] text-text-secondary">{plan.period}</span>
        </p>
      </div>

      <div className="mt-2 flex gap-2">
        {PLANS.filter((p) => p.id !== planId).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => navigate(`/app/checkout?plan=${p.id}`, { replace: true })}
            className="text-[13px] font-semibold text-purple hover:underline"
          >
            Passer à l&rsquo;offre {p.name.toLowerCase()} ({p.price} {p.period})
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-[20px] border border-border/60 bg-white p-4 shadow-[0_18px_60px_rgba(54,44,120,0.06)] sm:p-6">
        {error ? (
          <p className="text-[15px] text-red-500">{error}</p>
        ) : sessionId ? (
          <CheckoutEmbed
            key={sessionId}
            sessionId={sessionId}
            email={user?.email}
            returnUrl={`${window.location.origin}/app/courses?paid=1`}
            onComplete={() => navigate("/app/courses?paid=1", { replace: true })}
          />
        ) : (
          <p className="py-10 text-center text-[14px] text-text-secondary">Préparation du paiement…</p>
        )}
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-text-secondary">
        <Lock className="h-3.5 w-3.5" /> Paiement sécurisé par Whop. Résiliable à tout moment.
      </p>
    </div>
  );
}
