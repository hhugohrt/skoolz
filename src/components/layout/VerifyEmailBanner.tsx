import { useState } from "react";
import { Loader2, MailWarning } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

// Rappel discret tant que l'adresse n'est pas confirmée : ne bloque rien, mais permet de redemander le mail.
export function VerifyEmailBanner() {
  const { user, token } = useAuth();
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!user || user.emailVerified) return null;

  async function resend() {
    setState("sending");
    setError(null);
    try {
      await api.sendVerification(token!);
      setState("sent");
    } catch (err) {
      setState("idle");
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer l'e-mail pour le moment.");
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3">
      <MailWarning className="h-5 w-5 shrink-0 text-amber-600" />
      <p className="min-w-0 flex-1 text-[14px] leading-snug text-amber-900">
        {state === "sent" ? (
          <>Un e-mail de confirmation vient d&rsquo;être envoyé à <strong>{user.email}</strong>. Pense à regarder tes spams.</>
        ) : (
          <>
            Confirme ton adresse e-mail (<strong>{user.email}</strong>) pour sécuriser ton compte et pouvoir récupérer ton
            mot de passe.
          </>
        )}
      </p>
      {state !== "sent" && (
        <button
          type="button"
          onClick={resend}
          disabled={state === "sending"}
          className="flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
        >
          {state === "sending" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Renvoyer l&rsquo;e-mail
        </button>
      )}
      {error && <p className="basis-full text-[13px] text-red-600">{error}</p>}
    </div>
  );
}
