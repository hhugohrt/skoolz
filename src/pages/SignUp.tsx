import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleAuth } from "@/components/auth/GoogleAuth";
import { TextInput } from "@/components/auth/TextInput";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { usePageMeta } from "@/lib/usePageMeta";

export default function SignUp() {
  usePageMeta({ title: "Créer un compte — Skoolz", path: "/signup" });
  const { register } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password, firstName);
      navigate("/onboarding");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de créer le compte.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      headerPrompt="Déjà un compte ?"
      headerCtaLabel="Se connecter"
      headerCtaTo="/login"
      mascotSrc="/mascot-signup.webp"
    >
      <AuthCard title="Créer un compte" subtitle="Commence ton aventure avec Skoolz !">
        <GoogleAuth onDone={(user) => navigate(user.onboardingCompleted ? "/app" : "/onboarding")} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextInput
            label="Prénom"
            icon={User}
            type="text"
            placeholder="Ton prénom"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
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
          <TextInput
            label="Mot de passe"
            icon={Lock}
            isPassword
            placeholder="Au moins 8 caractères"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-[14px] text-red-500">{error}</p>}

          <PrimaryButton
            label={submitting ? "Création…" : "Créer un compte"}
            gradient={false}
            className="mt-2"
            disabled={submitting}
          />
        </form>

        <p className="text-center text-[14px] leading-[1.6] text-text-secondary">
          En créant un compte, tu acceptes nos{" "}
          <Link to="/cgu" className="text-purple underline underline-offset-2">
            Conditions d&rsquo;utilisation
          </Link>
          <br />
          et notre{" "}
          <Link to="/confidentialite" className="text-purple underline underline-offset-2">
            Politique de confidentialité
          </Link>
          , et tu confirmes avoir 15&nbsp;ans ou plus (ou l&rsquo;accord d&rsquo;un parent).
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
