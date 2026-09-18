import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Smartphone,
  BarChart3,
  BookOpen,
  ArrowRight,
  QrCode,
  Wand2,
  LineChart,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Mascot } from "@/components/Mascot";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";
import { Footer } from "@/components/layout/Footer";
import { usePageMeta } from "@/lib/usePageMeta";

const features = [
  {
    icon: Sparkles,
    title: "Fiches générées par IA",
    description: "Prends ton cours en photo, l'IA rédige une fiche de révision claire et structurée en quelques secondes.",
  },
  {
    icon: Smartphone,
    title: "Import par QR code",
    description: "Scanne un code depuis ton PC, prends tes photos avec le téléphone : elles arrivent instantanément sur ton ordinateur.",
  },
  {
    icon: BarChart3,
    title: "Suivi de progression",
    description: "Visualise ta progression matière par matière et garde une vue d'ensemble sur tes révisions.",
  },
  {
    icon: BookOpen,
    title: "Tout organisé au même endroit",
    description: "Cours, fiches, quiz et flashcards classés par matière et par chapitre, toujours faciles à retrouver.",
  },
];

const steps = [
  {
    icon: QrCode,
    title: "Importe ton cours",
    description: "Scanne le QR code, prends une ou plusieurs photos de ton cours avec ton téléphone.",
  },
  {
    icon: Wand2,
    title: "L'IA génère ta fiche",
    description: "En quelques secondes, une fiche de révision claire et structurée est prête à l'emploi.",
  },
  {
    icon: LineChart,
    title: "Révise et progresse",
    description: "Quiz, flashcards et suivi de progression pour ancrer durablement ce que tu apprends.",
  },
];

const faqs = [
  {
    question: "Skoolz est-il gratuit ?",
    answer:
      "Tu peux créer un compte gratuitement et commencer à générer des fiches de révision dès l'inscription.",
  },
  {
    question: "Quels types de cours puis-je importer ?",
    answer:
      "Des fichiers PDF, Word (DOC, DOCX), PowerPoint (PPT, PPTX) ou texte (TXT), ainsi que des photos de ton cours, prises avec l'appareil photo ou choisies dans ta galerie.",
  },
  {
    question: "Comment importer un cours en photo depuis mon téléphone ?",
    answer:
      "Depuis ton ordinateur, scanne le QR code affiché par Skoolz avec ton téléphone : prends ou choisis une ou plusieurs photos, elles arrivent aussitôt sur ton ordinateur et sont combinées en une seule fiche.",
  },
  {
    question: "La fiche contient-elle tout mon cours ?",
    answer:
      "Skoolz condense la forme mais garde le fond : chaque définition, formule, date et exemple du cours est repris, et une vérification compare la fiche au cours d'origine pour repérer les oublis. Relis toujours ta fiche : l'IA peut se tromper.",
  },
  {
    question: "Puis-je imprimer mes fiches de révision ?",
    answer:
      "Oui. Tu peux choisir une fiche colorée au format A4, en portrait ou en paysage, puis l'imprimer ou l'enregistrer en PDF.",
  },
];

const PAGE_TITLE = "Skoolz — Fiches de révision par IA, colorées et imprimables";
const PAGE_DESCRIPTION =
  "Importe ton cours en PDF, Word ou photo : Skoolz génère une fiche de révision synthétique et complète, à imprimer en A4. Gratuit pour commencer.";

export default function Landing() {
  usePageMeta({ title: PAGE_TITLE, description: PAGE_DESCRIPTION, indexable: true, path: "/" });

  // Données structurées FAQ : elles décrivent exactement les questions visibles plus bas sur la page.
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-jsonld";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <BackgroundBlobs />

      <div className="relative mx-auto flex min-h-screen max-w-[1672px] flex-col px-5 sm:px-8 md:px-12 xl:px-[88px]">
        <header className="flex items-center justify-between gap-3 py-5 xl:py-6">
          <Logo />
          <nav aria-label="Navigation principale" className="hidden items-center gap-8 text-[15px] font-medium text-text-secondary md:flex">
            <a href="#fonctionnalites" className="transition-colors hover:text-text">
              Fonctionnalités
            </a>
            <a href="#comment-ca-marche" className="transition-colors hover:text-text">
              Comment ça marche
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="whitespace-nowrap rounded-full px-3.5 py-2 text-[14px] font-semibold text-text transition-colors hover:bg-purple/[0.09] sm:px-5 sm:py-2.5 sm:text-[15px]"
            >
              Se connecter
            </Link>
            <Link
              to="/signup"
              className="bg-cta-gradient whitespace-nowrap rounded-full px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(109,74,255,0.28)] transition-transform hover:brightness-105 active:scale-[0.98] sm:px-6 sm:py-3 sm:text-[15px]"
            >
              Créer un compte
            </Link>
          </div>
        </header>

        <main>
        <section className="flex flex-col items-center gap-10 pb-16 pt-10 text-center sm:pb-20 sm:pt-14 xl:pb-28 xl:pt-16">
          <div className="flex max-w-[820px] flex-col items-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple/[0.09] px-4 py-1.5 text-[13px] font-semibold text-purple sm:text-[14px]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
              Révise plus vite, grâce à l&rsquo;IA
            </span>

            <h1 className="font-display mt-5 text-[38px] font-extrabold leading-[1.05] tracking-[-0.02em] text-text sm:text-[54px] md:text-[64px] xl:text-[78px] xl:leading-[0.98]">
              Ton espace d&rsquo;étude,
              <br />
              tout <span className="text-purple">simplement.</span>
            </h1>

            <p className="mt-5 max-w-[560px] text-[16px] leading-[1.6] text-text-secondary sm:text-[19px] xl:mt-6 xl:text-[21px]">
              Prends ton cours en photo, laisse l&rsquo;IA créer ta fiche de révision, et suis ta
              progression&nbsp;: Skoolz réunit tout ce dont tu as besoin pour réviser sereinement.
            </p>

            <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row xl:mt-9">
              <Link
                to="/signup"
                className="bg-cta-gradient flex h-[58px] w-full items-center justify-center gap-2 rounded-[16px] px-7 text-[16px] font-semibold text-white shadow-[0_14px_30px_rgba(109,74,255,0.28)] transition-transform hover:brightness-105 active:scale-[0.99] sm:w-auto"
              >
                Créer un compte gratuitement
                <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.25} />
              </Link>
              <a
                href="#comment-ca-marche"
                className="flex h-[58px] w-full items-center justify-center gap-2 rounded-[16px] border border-border bg-white px-7 text-[16px] font-semibold text-text transition-colors hover:border-purple/40 sm:w-auto"
              >
                Voir comment ça marche
              </a>
            </div>
          </div>

          <Mascot priority src="/mascot-signup.webp" className="h-[180px] w-[260px] sm:h-[220px] sm:w-[320px] xl:h-[260px] xl:w-[380px]" />
        </section>

        <section id="fonctionnalites" className="scroll-mt-24 py-14 sm:py-20 xl:py-24">
          <div className="mx-auto max-w-[640px] text-center">
            <h2 className="font-display text-[28px] font-bold text-text sm:text-[36px] xl:text-[42px]">
              Tout ce qu&rsquo;il te faut pour réviser
            </h2>
            <p className="mt-3 text-[15px] text-text-secondary sm:text-[17px]">
              Une seule app pour importer, organiser et réviser — sans effort.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:mt-14 xl:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="shadow-card flex flex-col gap-4 rounded-[20px] border border-border bg-white p-6 transition-transform hover:-translate-y-1"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple/10">
                  <feature.icon className="h-[20px] w-[20px] text-purple" strokeWidth={2.25} />
                </span>
                <div>
                  <p className="text-[16px] font-semibold leading-tight text-text sm:text-[17px]">
                    {feature.title}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-[1.55] text-text-secondary sm:text-[15px]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="comment-ca-marche" className="scroll-mt-24 py-14 sm:py-20 xl:py-24">
          <div className="mx-auto max-w-[640px] text-center">
            <h2 className="font-display text-[28px] font-bold text-text sm:text-[36px] xl:text-[42px]">
              Comment ça marche
            </h2>
            <p className="mt-3 text-[15px] text-text-secondary sm:text-[17px]">
              Trois étapes, et ta fiche de révision est prête.
            </p>
          </div>

          <div className="relative mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5 xl:mt-14">
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-purple/10">
                  <step.icon className="h-[26px] w-[26px] text-purple" strokeWidth={2} />
                  <span className="bg-cta-gradient absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <p className="mt-4 text-[16px] font-semibold text-text sm:text-[17px]">{step.title}</p>
                <p className="mt-1.5 max-w-[260px] text-[14px] leading-[1.55] text-text-secondary sm:text-[15px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-14 sm:py-20 xl:py-24">
          <div className="bg-cta-gradient shadow-card flex flex-col items-center gap-5 rounded-[28px] px-6 py-12 text-center sm:px-12 sm:py-16">
            <h2 className="font-display max-w-[560px] text-[26px] font-bold leading-[1.15] text-white sm:text-[34px] xl:text-[40px]">
              Prêt à réviser plus efficacement&nbsp;?
            </h2>
            <p className="max-w-[440px] text-[15px] text-white/85 sm:text-[17px]">
              Rejoins Skoolz gratuitement et transforme tes cours en fiches de révision en quelques
              secondes.
            </p>
            <Link
              to="/signup"
              className="mt-2 flex h-[56px] items-center justify-center gap-2 rounded-[16px] bg-white px-7 text-[16px] font-semibold text-purple shadow-[0_14px_30px_rgba(0,0,0,0.15)] transition-transform hover:brightness-95 active:scale-[0.99]"
            >
              Créer un compte gratuitement
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.25} />
            </Link>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 py-14 sm:py-20 xl:py-24">
          <div className="mx-auto max-w-[640px] text-center">
            <h2 className="font-display text-[28px] font-bold text-text sm:text-[36px] xl:text-[42px]">
              Questions fréquentes
            </h2>
          </div>
          <div className="mx-auto mt-8 flex max-w-[760px] flex-col gap-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-[16px] border border-border bg-white px-5 py-4">
                <summary className="cursor-pointer list-none text-[16px] font-semibold text-text marker:hidden [&::-webkit-details-marker]:hidden">
                  <h3 className="inline">{faq.question}</h3>
                </summary>
                <p className="mt-2 text-[15px] leading-[1.6] text-text-secondary">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
        </main>

        <div className="pb-5 pt-6 xl:pb-6">
          <Footer />
        </div>
      </div>
    </div>
  );
}
