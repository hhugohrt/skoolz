import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { SocialButton } from "@/components/auth/SocialButton";
import { Divider } from "@/components/auth/Divider";
import { TextInput } from "@/components/auth/TextInput";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function SignUp() {
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
      navigate("/onboarding/level");
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
      mascotSrc="/mascot-signup.png"
    >
      <AuthCard title="Créer un compte" subtitle="Commence ton aventure avec Skoolz !">
        <SocialButton icon={<GoogleIcon className="h-full w-full" />} label="Continuer avec Google" />

        <Divider />

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
          <a href="#" className="text-purple underline underline-offset-2">
            Conditions d&rsquo;utilisation
          </a>
          <br />
          et notre{" "}
          <a href="#" className="text-purple underline underline-offset-2">
            Politique de confidentialité
          </a>
          .
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
