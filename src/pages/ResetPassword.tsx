import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircleCheck, Lock } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { TextInput } from "@/components/auth/TextInput";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { api, ApiError } from "@/lib/api";
import { usePageMeta } from "@/lib/usePageMeta";

export default function ResetPassword() {
  usePageMeta({ title: "Nouveau mot de passe — Skoolz", path: "/reset-password" });
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Les deux mots de passe ne sont pas identiques.");
      return;
    }
    setSubmitting(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de changer le mot de passe pour le moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      headerPrompt="Tu t'en souviens ?"
      headerCtaLabel="Se connecter"
      headerCtaTo="/login"
      heroHeading={
        <>
          Un <span className="text-purple">nouveau départ</span>
        </>
      }
      heroSubtitle="Choisis un nouveau mot de passe et reprends tes révisions là où tu les avais laissées."
    >
      <AuthCard title="Nouveau mot de passe" subtitle="Choisis un mot de passe d'au moins 8 caractères.">
        {done ? (
          <div className="flex flex-col gap-4">
            <p className="flex items-start gap-3 rounded-[14px] border border-purple/20 bg-purple/[0.06] p-4 text-[15px] leading-relaxed text-text">
              <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-purple" />
              <span>C&rsquo;est fait, ton mot de passe a été changé. Tu peux maintenant te connecter.</span>
            </p>
            <Link
              to="/login"
              className="flex h-[58px] w-full items-center justify-center rounded-[16px] bg-purple text-[17px] font-semibold text-white"
            >
              Me connecter
            </Link>
          </div>
        ) : !token ? (
          <div className="flex flex-col gap-4">
            <p className="text-[15px] text-red-500">Ce lien est incomplet. Refais une demande de réinitialisation.</p>
            <Link to="/forgot-password" className="text-center text-[15px] font-semibold text-purple hover:underline">
              Demander un nouveau lien
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextInput
              label="Nouveau mot de passe"
              icon={Lock}
              isPassword
              placeholder="Au moins 8 caractères"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <TextInput
              label="Confirme le mot de passe"
              icon={Lock}
              isPassword
              placeholder="Retape ton mot de passe"
              autoComplete="new-password"
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {error && (
              <p className="text-[14px] text-red-500">
                {error}{" "}
                {/invalide|expiré/.test(error) && (
                  <Link to="/forgot-password" className="font-semibold underline">
                    Demander un nouveau lien
                  </Link>
                )}
              </p>
            )}
            <PrimaryButton label={submitting ? "Enregistrement…" : "Changer le mot de passe"} gradient={false} disabled={submitting} />
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
