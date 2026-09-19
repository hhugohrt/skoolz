import { useEffect, useRef, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Images, Loader2, Plus, UploadCloud, X } from "lucide-react";
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

interface StagedPhoto {
  id: string;
  file: File;
  url: string;
}

export function CourseDropzone({ layout, onUploaded }: CourseDropzoneProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [needsPlan, setNeedsPlan] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  // Photos en attente : l'appareil photo ne rend qu'une image à la fois, on les rassemble avant de créer la fiche.
  const [staged, setStaged] = useState<StagedPhoto[]>([]);
  const stagedRef = useRef<StagedPhoto[]>([]);
  stagedRef.current = staged;

  useEffect(() => () => stagedRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  function stagePhotos(files: File[]) {
    setError(null);
    setPhase("idle");
    setStaged((prev) => {
      const room = MAX_PHOTOS - prev.length;
      const added = files.slice(0, Math.max(0, room)).map((file) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...added];
    });
  }

  function removeStaged(id: string) {
    setStaged((prev) => {
      prev.filter((p) => p.id === id).forEach((p) => URL.revokeObjectURL(p.url));
      return prev.filter((p) => p.id !== id);
    });
  }

  function clearStaged() {
    staged.forEach((p) => URL.revokeObjectURL(p.url));
    setStaged([]);
  }

  function handleFiles(input: File[]) {
    setError(null);
    setNeedsPlan(false);
    const files = input.slice(0, MAX_PHOTOS);
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length > 0 && images.length < files.length) {
      setPhase("error");
      setError("Importe soit des photos, soit un seul document (PDF, Word…), pas les deux à la fois.");
      return;
    }
    if (images.length > 0) {
      stagePhotos(images);
      return;
    }
    if (files.length > 1) {
      setPhase("error");
      setError("Importe un seul document à la fois.");
      return;
    }
    submit(undefined, files[0]);
  }

  async function submit(images?: File[], document?: File) {
    setError(null);
    setNeedsPlan(false);
    setPhase("uploading");
    try {
      let courseId: string;
      if (images && images.length > 0) {
        // Une ou plusieurs photos : un seul cours, une seule fiche. Chaque photo est réduite puis envoyée à part.
        const { course } = await api.createPhotoCourse(token!);
        courseId = course.id;
        for (const [index, photo] of images.entries()) {
          setProgress(images.length > 1 ? `Photo ${index + 1} sur ${images.length}…` : null);
          await api.addCoursePhoto(token!, courseId, await compressImage(photo));
        }
        setProgress(null);
      } else {
        const { course } = await api.uploadCourse(token!, document!);
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
  const picker = (onFiles: (files: File[]) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onFiles(files);
    e.target.value = "";
  };

  return (
    <div>
      {/* Entrées cachées : appareil photo (une photo à la fois) et galerie (plusieurs photos). */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={picker(stagePhotos)} />
      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={picker(stagePhotos)} />

      {staged.length > 0 ? (
        <div className="rounded-[20px] border-2 border-purple/30 bg-white p-4 sm:p-5">
          {busy ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple" />
              <p className="text-[16px] font-semibold text-text">
                {phase === "uploading" ? (progress ?? "Import de tes photos…") : "Je prépare ta fiche…"}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[15px] font-semibold text-text">
                  {staged.length} photo{staged.length > 1 ? "s" : ""} prête{staged.length > 1 ? "s" : ""}
                </p>
                <button type="button" onClick={clearStaged} className="text-[13px] font-semibold text-text-secondary hover:text-text">
                  Tout effacer
                </button>
              </div>

              <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {staged.map((photo, index) => (
                  <li key={photo.id} className="relative aspect-square overflow-hidden rounded-[10px] border border-border bg-surface-2">
                    <img src={photo.url} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 left-1 rounded-full bg-black/55 px-1.5 text-[10px] font-semibold text-white">{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeStaged(photo.id)}
                      aria-label={`Retirer la photo ${index + 1}`}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
                {staged.length < MAX_PHOTOS && (
                  <li>
                    <button
                      type="button"
                      onClick={() => cameraRef.current?.click()}
                      aria-label="Ajouter une photo"
                      className="flex aspect-square w-full items-center justify-center rounded-[10px] border-2 border-dashed border-border text-purple hover:border-purple/50"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </li>
                )}
              </ul>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  disabled={staged.length >= MAX_PHOTOS}
                  className="flex h-11 items-center justify-center gap-2 rounded-[12px] border border-border bg-white text-[14px] font-semibold text-text transition-colors hover:border-purple/40 disabled:opacity-50"
                >
                  <Camera className="h-4 w-4 text-purple" /> Prendre une photo
                </button>
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  disabled={staged.length >= MAX_PHOTOS}
                  className="flex h-11 items-center justify-center gap-2 rounded-[12px] border border-border bg-white text-[14px] font-semibold text-text transition-colors hover:border-purple/40 disabled:opacity-50"
                >
                  <Images className="h-4 w-4 text-purple" /> Galerie
                </button>
              </div>

              <button
                type="button"
                onClick={() => submit(staged.map((p) => p.file))}
                className="mt-3 h-[52px] w-full rounded-[14px] bg-purple text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Créer ma fiche{staged.length > 1 ? ` (${staged.length} photos)` : ""}
              </button>
            </>
          )}
        </div>
      ) : (
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
          <input ref={inputRef} type="file" accept={ACCEPTED} multiple className="hidden" onChange={picker(handleFiles)} />

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
              <p className="text-[14px] text-text-secondary">ou touche pour importer un cours ou des photos</p>
              <p className="mt-1 text-[13px] text-text-secondary">PDF, DOC, DOCX, PPT, PPTX, TXT ou photos (jusqu'à 20) — 20 Mo max</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraRef.current?.click();
                }}
                className="mt-1 flex items-center gap-2 rounded-full bg-purple/10 px-4 py-2 text-[14px] font-semibold text-purple"
              >
                <Camera className="h-4 w-4" /> Prendre en photo
              </button>
            </>
          )}
        </div>
      )}

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
