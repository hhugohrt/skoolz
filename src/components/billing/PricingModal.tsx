import { useEffect, useState } from "react";
import { Check, Copy, Loader2, Share2, Users, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { Plan } from "@/lib/pricing";
import { PlanPicker } from "@/components/billing/PlanPicker";

// Fenêtre « Débloquer » : offres + bouton S'abonner, ou lien à envoyer à un parent qui paiera.
export function PricingModal({ onClose }: { onClose: () => void }) {
  const { token, user } = useAuth();
  const [plan, setPlan] = useState<Plan["id"]>("yearly");
  const [subscribing, setSubscribing] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [loadingLink, setLoadingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  async function subscribe() {
    setSubscribing(true);
    setError(null);
    try {
      const { url } = await api.createCheckout(token!, plan);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de démarrer le paiement pour le moment.");
      setSubscribing(false);
    }
  }

  async function askParent() {
    setLoadingLink(true);
    setError(null);
    try {
      const { url } = await api.createParentLink(token!);
      setLink(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de créer le lien pour le moment.");
    } finally {
      setLoadingLink(false);
    }
  }

  const message = `Salut ! J'utilise Skoolz pour mes révisions. Tu peux m'aider à débloquer mes fiches ? C'est ici : ${link}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copie impossible : sélectionne le texte et copie-le à la main.");
    }
  }

  async function share() {
    try {
      await navigator.share({ title: "Skoolz", text: message });
    } catch {
      /* partage annulé */
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Débloquer mes fiches">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[24px] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-[520px] sm:rounded-[24px] sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:bg-purple/10"
        >
          <X className="h-5 w-5" />
        </button>

        {user?.isPremium ? (
          <>
            <h2 className="pr-8 font-display text-[24px] font-bold text-text">Tu es abonné 🎉</h2>
            <p className="mt-2 text-[14px] text-text-secondary">
              Toutes tes fiches sont débloquées. Merci de faire confiance à Skoolz !
            </p>
            <a
              href="https://whop.com/@me/settings/memberships/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex h-[50px] w-full items-center justify-center rounded-[16px] border border-border bg-white text-[15px] font-semibold text-text transition-colors hover:border-purple/40"
            >
              Gérer mon abonnement
            </a>
          </>
        ) : (
          <>
        <h2 className="pr-8 font-display text-[24px] font-bold text-text">Débloque tes fiches</h2>
        <p className="mt-1 text-[14px] text-text-secondary">
          {user ? `${user.firstName}, ` : ""}abonne-toi pour lire, imprimer et modifier toutes tes fiches.
        </p>

        <div className="mt-5">
          <PlanPicker value={plan} onChange={setPlan} />
        </div>

        <button
          type="button"
          onClick={subscribe}
          disabled={subscribing}
          className="mt-6 flex h-[54px] w-full items-center justify-center gap-2 rounded-[16px] bg-purple text-[16px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
        >
          {subscribing && <Loader2 className="h-4 w-4 animate-spin" />}
          S&rsquo;abonner
        </button>

        <div className="my-5 flex items-center gap-3 text-[12px] text-text-secondary">
          <span className="h-px flex-1 bg-border" />
          ou
          <span className="h-px flex-1 bg-border" />
        </div>

        {link ? (
          <div className="rounded-[14px] border border-border bg-surface-2/60 p-4">
            <p className="text-[14px] font-semibold text-text">Envoie ce message à ton parent</p>
            <p className="mt-2 break-words rounded-[10px] bg-white p-3 text-[13px] leading-snug text-text-secondary">{message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copy}
                className="flex items-center gap-1.5 rounded-full bg-purple/10 px-4 py-2 text-[14px] font-semibold text-purple"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copié" : "Copier"}
              </button>
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  type="button"
                  onClick={share}
                  className="flex items-center gap-1.5 rounded-full bg-purple px-4 py-2 text-[14px] font-semibold text-white"
                >
                  <Share2 className="h-4 w-4" /> Partager
                </button>
              )}
            </div>
            <p className="mt-3 text-[12px] text-text-secondary">Le lien est valable 7 jours.</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={askParent}
            disabled={loadingLink}
            className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[16px] border border-border bg-white text-[15px] font-semibold text-text transition-colors hover:border-purple/40 disabled:opacity-60"
          >
            {loadingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4 text-purple" />}
            Demander à mon parent de payer
          </button>
        )}
        {error && <p className="mt-3 text-[13px] text-red-500">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
