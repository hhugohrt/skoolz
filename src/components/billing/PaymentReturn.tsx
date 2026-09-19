import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CircleCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

// Retour depuis la page de paiement Whop (?paid=1) : le webhook peut arriver quelques secondes après,
// on interroge donc le serveur jusqu'à voir le compte passer en abonné.
export function PaymentReturn() {
  const { token, user, setUser } = useAuth();
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const returning = new URLSearchParams(search).get("paid") === "1";
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (!returning || !token) return;
    let stopped = false;
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      try {
        const { user } = await api.me(token);
        if (user.isPremium) {
          setUser(user);
          clearInterval(timer);
          return;
        }
      } catch {
        /* on réessaie */
      }
      if (!stopped && tries >= 20) {
        clearInterval(timer);
        setGaveUp(true);
      }
    }, 2000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [returning, token, setUser]);

  if (!returning) return null;

  const done = user?.isPremium === true;
  return (
    <div className="mb-6 flex items-start gap-3 rounded-[14px] border border-purple/20 bg-purple/[0.06] px-4 py-3">
      {done ? (
        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-purple" />
      ) : (
        <Loader2 className={`mt-0.5 h-5 w-5 shrink-0 text-purple ${gaveUp ? "" : "animate-spin"}`} />
      )}
      <p className="min-w-0 flex-1 text-[14px] leading-snug text-text">
        {done
          ? "Paiement confirmé, merci ! Toutes tes fiches sont débloquées."
          : gaveUp
            ? "On n'a pas encore reçu la confirmation du paiement. Recharge la page dans quelques instants ; si rien ne change, écris-nous."
            : "Paiement reçu, on débloque tes fiches…"}
      </p>
      <button
        type="button"
        onClick={() => navigate(pathname, { replace: true })}
        className="shrink-0 text-[13px] font-semibold text-text-secondary hover:text-text"
      >
        Fermer
      </button>
    </div>
  );
}
