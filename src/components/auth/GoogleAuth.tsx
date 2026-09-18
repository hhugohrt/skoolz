import { useEffect, useState } from "react";
import { SocialButton } from "@/components/auth/SocialButton";
import { Divider } from "@/components/auth/Divider";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { useAuth } from "@/context/AuthContext";
import { ApiError, type ApiUser } from "@/lib/api";
import { GOOGLE_CLIENT_ID, GoogleCancelledError, loadGoogleScript, requestGoogleAccessToken } from "@/lib/google";

// Bouton « Continuer avec Google » + séparateur. Ne s'affiche que si la connexion Google est configurée
// (VITE_GOOGLE_CLIENT_ID), pour ne jamais montrer un bouton qui ne fait rien.
export function GoogleAuth({ onDone }: { onDone: (user: ApiUser) => void }) {
  const { loginWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (GOOGLE_CLIENT_ID) loadGoogleScript().catch(() => {});
  }, []);

  if (!GOOGLE_CLIENT_ID) return null;

  async function handleClick() {
    setError(null);
    setBusy(true);
    try {
      // Le script est chargé dès l'affichage de la page ; s'il ne l'était pas, on retente une fois.
      await loadGoogleScript();
      const accessToken = await requestGoogleAccessToken();
      const user = await loginWithGoogle(accessToken);
      onDone(user);
    } catch (err) {
      if (err instanceof GoogleCancelledError) return;
      setError(err instanceof ApiError ? err.message : "Connexion avec Google impossible pour le moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SocialButton
        icon={<GoogleIcon className="h-full w-full" />}
        label={busy ? "Connexion…" : "Continuer avec Google"}
        onClick={handleClick}
        disabled={busy}
      />
      {error && <p className="text-[14px] text-red-500">{error}</p>}
      <Divider />
    </>
  );
}
