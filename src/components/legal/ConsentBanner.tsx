import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConsent, loadWhopPixel, onConsentChange, setConsent } from "@/lib/consent";

// Bandeau de consentement compact : « Refuser » et « Accepter » ont exactement le même poids visuel.
// Sans réponse, rien n'est chargé.
export function ConsentBanner() {
  const [choice, setChoice] = useState(getConsent());

  useEffect(() => {
    if (getConsent() === "granted") loadWhopPixel();
    return onConsentChange(() => setChoice(getConsent()));
  }, []);

  if (choice !== null) return null;

  const button =
    "h-9 flex-1 rounded-full border border-border bg-white px-4 text-[13px] font-semibold text-text transition-colors hover:border-purple/40 sm:flex-none";

  return (
    <div
      role="dialog"
      aria-label="Cookies et mesure d'audience"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-[620px] flex-col gap-2.5 rounded-[16px] border border-border/60 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_10px_36px_rgba(54,44,120,0.18)] backdrop-blur sm:flex-row sm:items-center sm:gap-4 sm:px-4"
    >
      <p className="text-[13px] leading-snug text-text-secondary">
        On mesure l&rsquo;audience de Skoolz (cookie Whop) pour l&rsquo;améliorer. Tu peux refuser, ça ne change rien pour toi.{" "}
        <Link to="/confidentialite" className="font-semibold text-purple underline">
          En savoir plus
        </Link>
      </p>
      <div className="flex shrink-0 gap-2">
        <button type="button" onClick={() => setConsent("denied")} className={button}>
          Refuser
        </button>
        <button type="button" onClick={() => setConsent("granted")} className={button}>
          Accepter
        </button>
      </div>
    </div>
  );
}
