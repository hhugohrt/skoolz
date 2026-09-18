import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, BookOpen, BarChart3, Users } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { usePageMeta } from "@/lib/usePageMeta";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleAuth } from "@/components/auth/GoogleAuth";
import { TextInput } from "@/components/auth/TextInput";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import type { FeatureData } from "@/components/MarketingHero";

const heroFeatures: FeatureData[] = [
  {
    icon: BookOpen,
    title: "Tes cours toujours accessibles",
    description: "Où que tu sois, quand tu veux.",
  },
  {
    icon: BarChart3,
    title: "Suis tes progrès",
    description: "Vois tes efforts porter leurs fruits.",
  },
  {
    icon: Users,
    title: "Une communauté motivante",
    description: "Une app pensée pour les élèves.",
  },
];

export default function SignIn() {
  usePageMeta({ title: "Se connecter — Skoolz", path: "/login" });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(user.onboardingCompleted ? "/app" : "/onboarding/level");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de se connecter.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      headerPrompt="Pas encore de compte ?"
      headerCtaLabel="Créer un compte"
      headerCtaTo="/signup"
      heroHeading={
        <>
          Prêt à reprendre
          <br />
          tes <span className="text-purple">révisions</span> ?
        </>
      }
      heroSubtitle="Retrouve tous tes cours, tes fiches et ta progression au même endroit. On t'attend !"
      heroFeatures={heroFeatures}
    >
      <AuthCard title="Ravi de te revoir !" subtitle="Connecte-toi à ton compte Skoolz.">
        <GoogleAuth onDone={(user) => navigate(user.onboardingCompleted ? "/app" : "/onboarding/level")} />

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
          <div className="flex flex-col gap-2">
            <TextInput
              label="Mot de passe"
              icon={Lock}
              isPassword
              placeholder="Ton mot de passe"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Link to="/forgot-password" className="self-end text-[14px] font-semibold text-purple hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          {error && <p className="text-[14px] text-red-500">{error}</p>}

          <PrimaryButton
            label={submitting ? "Connexion…" : "Se connecter"}
            gradient={false}
            disabled={submitting}
          />
        </form>

        <p className="text-center text-[14px] leading-[1.6] text-text-secondary">
          En te connectant, tu acceptes nos{" "}
          <Link to="/cgu" className="text-purple underline underline-offset-2">
            Conditions d&rsquo;utilisation
          </Link>
          <br />
          et notre{" "}
          <Link to="/confidentialite" className="text-purple underline underline-offset-2">
            Politique de confidentialité
          </Link>
          .
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
