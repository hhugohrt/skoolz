import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, MailCheck } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { TextInput } from "@/components/auth/TextInput";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { api, ApiError } from "@/lib/api";
import { usePageMeta } from "@/lib/usePageMeta";

export default function ForgotPassword() {
  usePageMeta({ title: "Mot de passe oublié — Skoolz", path: "/forgot-password" });
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer la demande pour le moment.");
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
          Pas de <span className="text-purple">panique</span> !
        </>
      }
      heroSubtitle="On t'envoie un lien pour choisir un nouveau mot de passe, et tu retrouves tes cours."
    >
      <AuthCard title="Mot de passe oublié" subtitle="Entre ton adresse e-mail, on t'envoie un lien de réinitialisation.">
        {sent ? (
          <div className="flex flex-col gap-4">
            <p className="flex items-start gap-3 rounded-[14px] border border-purple/20 bg-purple/[0.06] p-4 text-[15px] leading-relaxed text-text">
              <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-purple" />
              <span>
                Si un compte existe pour <strong>{email}</strong>, un e-mail vient de partir. Regarde aussi dans tes
                spams. Le lien est valable 1&nbsp;heure.
              </span>
            </p>
            <Link to="/login" className="text-center text-[15px] font-semibold text-purple hover:underline">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextInput
              label="Adresse e-mail"
              icon={Mail}
              type="email"
              placeholder="ton@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="text-[14px] text-red-500">{error}</p>}
            <PrimaryButton label={submitting ? "Envoi…" : "Envoyer le lien"} gradient={false} disabled={submitting} />
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
