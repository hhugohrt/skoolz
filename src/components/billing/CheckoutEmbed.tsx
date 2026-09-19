import { useEffect, useState } from "react";
import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { Loader2 } from "lucide-react";

// Formulaire de paiement Whop affiché directement dans la page Skoolz (aucune redirection).
export function CheckoutEmbed({
  sessionId,
  returnUrl,
  email,
  onComplete,
}: {
  sessionId: string;
  returnUrl: string;
  email?: string;
  onComplete: () => void;
}) {
  const [ready, setReady] = useState(false);
  // Filet de sécurité : le message de chargement ne doit jamais rester par-dessus le formulaire.
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 6000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="relative min-h-[320px]">
      {!ready && (
        <p className="absolute inset-x-0 top-8 flex items-center justify-center gap-2 text-[14px] text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-purple" /> Chargement du paiement sécurisé…
        </p>
      )}
      <WhopCheckoutEmbed
        sessionId={sessionId}
        returnUrl={returnUrl}
        theme="light"
        skipRedirect
        prefill={email ? { email } : undefined}
        onComplete={() => onComplete()}
        onStateChange={(state) => state === "ready" && setReady(true)}
      />
    </div>
  );
}
