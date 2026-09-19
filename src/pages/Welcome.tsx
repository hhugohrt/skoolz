import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, FileUp, Printer, Sparkles, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Mascot } from "@/components/Mascot";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";
import { useAuth } from "@/context/AuthContext";
import { usePageMeta } from "@/lib/usePageMeta";
import { reopenConsent } from "@/lib/consent";

const PAGE_TITLE = "Skoolz — Fiches de révision par IA, colorées et imprimables";
const PAGE_DESCRIPTION =
  "Importe ton cours en PDF, Word ou photo : Skoolz génère une fiche de révision synthétique et complète, à imprimer en A4.";

interface Slide {
  icon: LucideIcon;
  title: string;
  text: string;
  mascot: string;
}

const SLIDES: Slide[] = [
  {
    icon: FileUp,
    title: "Importe ton cours",
    text: "Une photo, un PDF ou un document Word, depuis ton téléphone ou ton ordinateur.",
    mascot: "/mascot-signup.webp",
  },
  {
    icon: Sparkles,
    title: "L'IA crée ta fiche",
    text: "Synthétique mais complète, en fiche texte, colorée, compactée, carte mentale ou schéma.",
    mascot: "/mascot-login.webp",
  },
  {
    icon: Printer,
    title: "Révise et imprime",
    text: "Tes fiches sont rangées par matière, prêtes à imprimer en A4, avec quiz et flashcards.",
    mascot: "/mascot-signup.webp",
  },
];

// Page d'accueil : trois écrans pour comprendre Skoolz en dix secondes, puis inscription.
export default function Welcome() {
  usePageMeta({ title: PAGE_TITLE, description: PAGE_DESCRIPTION, indexable: true, path: "/" });
  const { user, loading } = useAuth();
  const [index, setIndex] = useState(0);

  if (!loading && user) return <Navigate to={user.onboardingCompleted ? "/app" : "/onboarding"} replace />;

  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <BackgroundBlobs />
      <div className="relative mx-auto flex min-h-screen max-w-[720px] flex-col items-center px-5 py-8 sm:px-8">
        <div className="flex w-full items-center justify-between">
          <Logo />
          <Link to="/login" className="text-[14px] font-semibold text-text-secondary hover:text-text">
            J&rsquo;ai déjà un compte
          </Link>
        </div>

        <div className="flex w-full flex-1 items-center justify-center py-8">
          <div className="w-full max-w-[560px] rounded-[20px] border border-border/60 bg-white p-8 text-center shadow-[0_18px_60px_rgba(54,44,120,0.1)] sm:p-12">
            <Mascot src={slide.mascot} priority className="mx-auto h-[120px] w-[175px]" />

            <div className="mx-auto mt-4 flex h-11 w-11 items-center justify-center rounded-full bg-purple/10 text-purple">
              <slide.icon className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <h1 className="mt-4 font-display text-[26px] font-bold text-text sm:text-[30px]">{slide.title}</h1>
            <p className="mx-auto mt-2 max-w-[400px] text-[16px] leading-relaxed text-text-secondary">{slide.text}</p>

            <div className="mt-6 flex items-center justify-center gap-2" aria-hidden>
              {SLIDES.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-purple" : "w-3 bg-purple/20"}`}
                />
              ))}
            </div>

            {last ? (
              <Link
                to="/signup"
                className="mt-8 flex h-[58px] w-full items-center justify-center gap-2 rounded-[16px] bg-purple text-[17px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Créer mon compte <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIndex(index + 1)}
                className="mt-8 flex h-[58px] w-full items-center justify-center gap-2 rounded-[16px] bg-purple text-[17px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Suivant <ArrowRight className="h-5 w-5" />
              </button>
            )}

            {!last && (
              <Link to="/signup" className="mt-3 block text-[14px] font-semibold text-text-secondary hover:text-text">
                Passer
              </Link>
            )}
          </div>
        </div>

        <nav aria-label="Liens légaux" className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[13px] text-text-secondary">
          <Link to="/mentions-legales" className="hover:text-text">
            Mentions légales
          </Link>
          <Link to="/cgu" className="hover:text-text">
            CGU
          </Link>
          <Link to="/confidentialite" className="hover:text-text">
            Confidentialité
          </Link>
          <button type="button" onClick={reopenConsent} className="hover:text-text">
            Gérer mes cookies
          </button>
        </nav>
      </div>
    </div>
  );
}
