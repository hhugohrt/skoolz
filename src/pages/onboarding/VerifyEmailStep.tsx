import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleCheck, Loader2, MailCheck } from "lucide-react";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

// Première étape de l'onboarding : on ne va pas plus loin tant que l'adresse n'est pas confirmée.
export default function OnboardingVerifyEmail() {
  const navigate = useNavigate();
  const { user, token, setUser, logout } = useAuth();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Le service d'e-mail n'est pas configuré (503) : on ne bloque pas l'élève.
  const [emailDown, setEmailDown] = useState(false);

  const verified = user?.emailVerified === true;

  // Le lien peut être ouvert dans un autre onglet ou sur un autre appareil : on interroge le serveur régulièrement.
  useEffect(() => {
    if (verified || !token) return;
    const timer = setInterval(() => {
      api
        .me(token)
        .then(({ user }) => user.emailVerified && setUser(user))
        .catch(() => {});
    }, 4000);
    return () => clearInterval(timer);
  }, [verified, token, setUser]);

  async function resend() {
    setResending(true);
    setError(null);
    try {
      await api.sendVerification(token!);
      setResent(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) setEmailDown(true);
      else setError(err instanceof ApiError ? err.message : "Impossible d'envoyer l'e-mail pour le moment.");
    } finally {
      setResending(false);
    }
  }

  if (!user) return null;

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold text-text sm:text-[30px]">Confirme ton adresse e-mail</h1>

      {verified ? (
        <>
          <p className="mt-4 flex items-start gap-3 rounded-[14px] border border-purple/20 bg-purple/[0.06] p-4 text-[15px] leading-relaxed text-text">
            <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-purple" />
            <span>Merci, ton adresse est confirmée !</span>
          </p>
          <PrimaryButton label="Continuer" gradient={false} className="mt-8" onClick={() => navigate("/onboarding/level")} />
        </>
      ) : emailDown ? (
        <>
          <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
            L&rsquo;envoi d&rsquo;e-mails est momentanément indisponible. Tu peux continuer, on te demandera de confirmer ton
            adresse plus tard.
          </p>
          <PrimaryButton label="Continuer" gradient={false} className="mt-8" onClick={() => navigate("/onboarding/level")} />
        </>
      ) : (
        <>
          <p className="mt-4 flex items-start gap-3 rounded-[14px] border border-border bg-surface-2/60 p-4 text-[15px] leading-relaxed text-text">
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-purple" />
            <span>
              On vient d&rsquo;envoyer un e-mail à <strong className="break-all">{user.email}</strong>. Clique sur le lien
              qu&rsquo;il contient (pense à regarder tes spams), puis reviens ici.
            </span>
          </p>

          <p className="mt-4 flex items-center gap-2 text-[14px] text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin text-purple" />
            En attente de ta confirmation…
          </p>

          <button
            type="button"
            onClick={resend}
            disabled={resending || resent}
            className="mt-6 w-full rounded-full border border-border bg-white py-3 text-[15px] font-semibold text-text transition-colors hover:border-purple/40 disabled:opacity-60"
          >
            {resent ? "E-mail renvoyé" : resending ? "Envoi…" : "Renvoyer l'e-mail"}
          </button>
          {error && <p className="mt-3 text-[14px] text-red-500">{error}</p>}

          <button
            type="button"
            onClick={logout}
            className="mt-3 w-full text-center text-[14px] font-semibold text-text-secondary hover:text-text"
          >
            Ce n&rsquo;est pas la bonne adresse ? Se déconnecter
          </button>
        </>
      )}
    </div>
  );
}
