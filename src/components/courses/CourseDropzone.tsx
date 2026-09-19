import { useRef, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { compressImage } from "@/lib/imageCompress";
import { PricingModal } from "@/components/billing/PricingModal";
import type { SheetLayout } from "@/lib/sheetStyles";

type Phase = "idle" | "uploading" | "generating" | "error";

const MAX_PHOTOS = 20;

const ACCEPTED = ".pdf,.doc,.docx,.ppt,.pptx,.txt,image/*";

interface CourseDropzoneProps {
  layout: SheetLayout;
  onUploaded?: () => void;
}

export function CourseDropzone({ layout, onUploaded }: CourseDropzoneProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [needsPlan, setNeedsPlan] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);

  async function handleFiles(input: File[]) {
    setError(null);
    setNeedsPlan(false);
    const files = input.slice(0, MAX_PHOTOS);
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length > 0 && images.length < files.length) {
      setPhase("error");
      setError("Importe soit des photos, soit un seul document (PDF, Word…), pas les deux à la fois.");
      return;
    }
    if (images.length === 0 && files.length > 1) {
      setPhase("error");
      setError("Importe un seul document à la fois.");
      return;
    }

    setPhase("uploading");
    try {
      let courseId: string;
      if (images.length > 0) {
        // Une ou plusieurs photos : un seul cours, une seule fiche. Chaque photo est réduite puis envoyée à part.
        const { course } = await api.createPhotoCourse(token!);
        courseId = course.id;
        for (const [index, photo] of images.entries()) {
          setProgress(images.length > 1 ? `Photo ${index + 1} sur ${images.length}…` : null);
          await api.addCoursePhoto(token!, courseId, await compressImage(photo));
        }
        setProgress(null);
      } else {
        const { course } = await api.uploadCourse(token!, files[0]);
        courseId = course.id;
      }
      setPhase("generating");
      const { sheetId, suggestedSubject } = await api.generateSheet(token!, courseId);
      onUploaded?.();
      navigate(`/app/sheets/${sheetId}`, { state: { layout, suggestedSubject, justGenerated: true } });
    } catch (err) {
      setProgress(null);
      setPhase("error");
      setNeedsPlan(err instanceof ApiError && err.status === 402);
      setError(err instanceof ApiError ? err.message : "Impossible d'importer ce cours pour le moment.");
      onUploaded?.();
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length > 0) handleFiles(files);
  }

  const busy = phase === "uploading" || phase === "generating";

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => !busy && inputRef.current?.click()}
        className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragActive ? "border-purple bg-purple/[0.04]" : "border-border bg-white hover:border-purple/40"
        } ${busy ? "pointer-events-none opacity-70" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0) handleFiles(files);
            e.target.value = "";
          }}
        />

        {busy ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-purple" />
            <p className="text-[16px] font-semibold text-text">
              {phase === "uploading" ? (progress ?? "Import de ton cours…") : "Je prépare ta fiche…"}
            </p>
          </>
        ) : (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-purple/10">
              <UploadCloud className="h-6 w-6 text-purple" strokeWidth={2} />
            </span>
            <p className="text-[16px] font-semibold text-text">Glisse ton fichier ici</p>
            <p className="text-[14px] text-text-secondary">ou touche pour importer un cours ou plusieurs photos</p>
            <p className="mt-1 text-[13px] text-text-secondary">PDF, DOC, DOCX, PPT, PPTX, TXT ou photos (jusqu'à 20) — 20 Mo max</p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-3 text-[14px] text-red-500">
          {error}{" "}
          {needsPlan ? (
            <button type="button" onClick={() => setPlansOpen(true)} className="font-semibold text-purple underline">
              Voir les plans
            </button>
          ) : (
            <button type="button" onClick={() => setPhase("idle")} className="font-semibold underline">
              Réessayer
            </button>
          )}
        </p>
      )}
      {plansOpen && <PricingModal onClose={() => setPlansOpen(false)} />}
    </div>
  );
}
