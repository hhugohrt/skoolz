import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { usePageMeta } from "@/lib/usePageMeta";

type State = "checking" | "ok" | "error";

export default function VerifyEmail() {
  usePageMeta({ title: "Confirmation de l'adresse e-mail — Skoolz", path: "/verify-email" });
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { token: sessionToken, setUser } = useAuth();
  const [state, setState] = useState<State>(token ? "checking" : "error");
  const [message, setMessage] = useState(token ? "" : "Ce lien est incomplet.");
  // Le jeton est à usage unique : en développement React exécute l'effet deux fois, un seul appel doit partir.
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    api
      .verifyEmail(token)
      .then(async () => {
        setState("ok");
        // Si l'élève est connecté sur cet appareil, on met son profil à jour (le bandeau disparaît).
        if (sessionToken) {
          try {
            const { user } = await api.me(sessionToken);
            setUser(user);
          } catch {
            /* la page de confirmation reste valable même sans rafraîchir le profil */
          }
        }
      })
      .catch((err) => {
        setState("error");
        setMessage(err instanceof ApiError ? err.message : "Impossible de confirmer ton adresse pour le moment.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthLayout
      headerPrompt="Déjà confirmé ?"
      headerCtaLabel="Se connecter"
      headerCtaTo="/login"
      heroHeading={
        <>
          Bienvenue sur <span className="text-purple">Skoolz</span>
        </>
      }
      heroSubtitle="Ton adresse e-mail sécurise ton compte et te permet de récupérer ton mot de passe."
    >
      <AuthCard title="Confirmation de ton adresse" subtitle="Un instant, on vérifie ton lien.">
        {state === "checking" && (
          <p className="flex items-center gap-3 text-[15px] text-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin text-purple" />
            Vérification en cours…
          </p>
        )}
        {state === "ok" && (
          <div className="flex flex-col gap-4">
            <p className="flex items-start gap-3 rounded-[14px] border border-purple/20 bg-purple/[0.06] p-4 text-[15px] leading-relaxed text-text">
              <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-purple" />
              <span>Ton adresse e-mail est confirmée. Merci !</span>
            </p>
            <Link
              to={sessionToken ? "/app" : "/login"}
              className="flex h-[58px] w-full items-center justify-center rounded-[16px] bg-purple text-[17px] font-semibold text-white"
            >
              {sessionToken ? "Aller à mon espace" : "Me connecter"}
            </Link>
          </div>
        )}
        {state === "error" && (
          <div className="flex flex-col gap-4">
            <p className="flex items-start gap-3 text-[15px] text-red-500">
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{message}</span>
            </p>
            <Link to={sessionToken ? "/app" : "/login"} className="text-center text-[15px] font-semibold text-purple hover:underline">
              {sessionToken ? "Retour à mon espace (tu pourras redemander un e-mail)" : "Retour à la connexion"}
            </Link>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
