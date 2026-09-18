import { FileUp, Sparkles, FileCheck2, FolderCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CourseDropzone } from "@/components/courses/CourseDropzone";
import { QrCourseImportButton } from "@/components/courses/QrCourseImport";
import { DEFAULT_LAYOUT, STYLE_OPTIONS } from "@/lib/sheetStyles";

const STEPS = [
  {
    icon: FileUp,
    title: "1. Importe ton cours",
    description: "Dépose ton fichier",
  },
  {
    icon: Sparkles,
    title: "2. On le transforme",
    description: "Analyse et synthèse automatique",
  },
  {
    icon: FileCheck2,
    title: "3. Ta fiche est prête",
    description: "Claire, structurée, efficace",
  },
  {
    icon: FolderCheck,
    title: "4. On la range",
    description: "Classée automatiquement par matière et chapitre",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const layout = DEFAULT_LAYOUT;

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold text-text sm:text-[30px]">
        Bonjour, {user?.firstName}
      </h1>

      <div className="mt-8 rounded-[20px] border border-border/60 bg-white p-6 shadow-[0_18px_60px_rgba(54,44,120,0.06)] sm:p-8">
        <h2 className="font-display text-[22px] font-bold text-text sm:text-[26px]">
          Transforme ton cours en fiche de révision
        </h2>
        <p className="mt-2 max-w-[560px] text-[15px] text-text-secondary">
          Importe ton cours et Skoolz génère automatiquement une fiche claire, synthétique et prête à réviser.
        </p>

        <div className="mt-4">
          <CourseDropzone layout={layout} />
        </div>

        <div className="mt-4 flex justify-center">
          <QrCourseImportButton layout={layout} />
        </div>

        <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-text-secondary">
          <span>Chaque cours est généré sous toutes ces formes :</span>
          {STYLE_OPTIONS.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 rounded-full bg-purple/[0.08] px-2.5 py-1 font-medium text-purple"
            >
              <option.icon className="h-3.5 w-3.5" />
              {option.label}
            </span>
          ))}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.title} className="rounded-[14px] border border-border/60 bg-white p-5">
            <step.icon className="h-5 w-5 text-purple" strokeWidth={2} />
            <p className="mt-3 text-[15px] font-semibold text-text">{step.title}</p>
            <p className="mt-1 text-[13px] text-text-secondary">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
