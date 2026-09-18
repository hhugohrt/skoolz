import { useRef, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, type SheetLayout } from "@/lib/api";

type Phase = "idle" | "uploading" | "generating" | "error";

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

  async function handleFile(file: File) {
    setError(null);
    setPhase("uploading");
    try {
      const { course } = await api.uploadCourse(token!, file);
      setPhase("generating");
      const { sheetId } = await api.generateSheet(token!, course.id);
      onUploaded?.();
      navigate(`/app/sheets/${sheetId}`, { state: { layout } });
    } catch (err) {
      setPhase("error");
      setError(err instanceof ApiError ? err.message : "Impossible d'importer ce cours pour le moment.");
      onUploaded?.();
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
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
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        {busy ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-purple" />
            <p className="text-[16px] font-semibold text-text">
              {phase === "uploading" ? "Import de ton cours…" : "Je prépare ta fiche…"}
            </p>
          </>
        ) : (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-purple/10">
              <UploadCloud className="h-6 w-6 text-purple" strokeWidth={2} />
            </span>
            <p className="text-[16px] font-semibold text-text">Glisse ton fichier ici</p>
            <p className="text-[14px] text-text-secondary">ou clique pour importer un cours</p>
            <p className="mt-1 text-[13px] text-text-secondary">PDF, DOC, DOCX, PPT, PPTX, TXT ou photo — 20 Mo max</p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-3 text-[14px] text-red-500">
          {error}{" "}
          <button type="button" onClick={() => setPhase("idle")} className="font-semibold underline">
            Réessayer
          </button>
        </p>
      )}
    </div>
  );
}
