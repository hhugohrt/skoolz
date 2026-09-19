import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConsent, loadWhopPixel, onConsentChange, setConsent } from "@/lib/consent";

// Bandeau de consentement : « Refuser » et « Accepter » ont le même poids visuel. Sans réponse, rien n'est chargé.
export function ConsentBanner() {
  const [choice, setChoice] = useState(getConsent());

  useEffect(() => {
    if (getConsent() === "granted") loadWhopPixel();
    return onConsentChange(() => setChoice(getConsent()));
  }, []);

  if (choice !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookies et mesure d'audience"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-[560px] rounded-[18px] border border-border/60 bg-white p-4 shadow-[0_18px_60px_rgba(54,44,120,0.22)] pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5"
    >
      <p className="text-[14px] leading-snug text-text">
        On aimerait mesurer l&rsquo;audience du site et de nos publicités avec un pixel de mesure (Whop). Ça dépose un
        identifiant sur ton appareil. Tu peux refuser : Skoolz fonctionne pareil.{" "}
        <Link to="/confidentialite" className="font-semibold text-purple underline">
          En savoir plus
        </Link>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setConsent("denied")}
          className="h-11 rounded-full border border-border bg-white text-[14px] font-semibold text-text transition-colors hover:border-purple/40"
        >
          Refuser
        </button>
        <button
          type="button"
          onClick={() => setConsent("granted")}
          className="h-11 rounded-full border border-border bg-white text-[14px] font-semibold text-text transition-colors hover:border-purple/40"
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
