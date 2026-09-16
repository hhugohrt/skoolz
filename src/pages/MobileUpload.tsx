import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Camera, Loader2, CircleCheck, CircleAlert, Plus } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { compressImage } from "@/lib/compressImage";
import { Logo } from "@/components/Logo";
import { Mascot } from "@/components/Mascot";

type State = "checking" | "ready" | "uploading" | "invalid" | "error";

interface LocalPhoto {
  url: string;
}

export default function MobileUpload() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [state, setState] = useState<State>("checking");
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!sessionId) return;
    api
      .getUploadSessionStatus(sessionId)
      .then(({ status }) => {
        if (status === "pending" || status === "received") setState("ready");
        else setState("invalid");
      })
      .catch(() => setState("invalid"));
  }, [sessionId]);

  async function handleFile(file: File) {
    if (!sessionId) return;
    setState("uploading");
    setError(null);
    try {
      const compressed = await compressImage(file);
      await api.uploadSessionPhoto(sessionId, compressed);
      setPhotos((prev) => [...prev, { url: URL.createObjectURL(compressed) }]);
      setState("ready");
    } catch (err) {
      setState("error");
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer cette photo.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 py-10 text-center">
      <Logo className="mb-8" />

      {state === "checking" && <Loader2 className="h-8 w-8 animate-spin text-purple" />}

      {(state === "ready" || state === "uploading") && (
        <>
          {photos.length === 0 ? (
            <Mascot className="h-[130px] w-[190px]" />
          ) : (
            <div className="grid w-full max-w-[300px] grid-cols-3 gap-2">
              {photos.map((p, i) => (
                <div key={i} className="aspect-[3/4] overflow-hidden rounded-[10px] border border-border bg-surface-2">
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <h1 className="font-display mt-4 text-[22px] font-bold text-text">
            {photos.length === 0 ? "Prends une photo de ton cours" : `${photos.length} photo${photos.length > 1 ? "s" : ""} envoyée${photos.length > 1 ? "s" : ""}`}
          </h1>
          <p className="mt-2 max-w-[300px] text-[14px] text-text-secondary">
            {photos.length === 0
              ? "Elle sera envoyée directement sur ton ordinateur."
              : "Plusieurs pages ? Ajoute-en une autre. Sinon, retourne sur ton ordinateur."}
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={state === "uploading"}
            onClick={() => inputRef.current?.click()}
            className="bg-cta-gradient mt-8 flex h-[58px] w-full max-w-[280px] items-center justify-center gap-2 rounded-[16px] text-[16px] font-semibold text-white shadow-[0_14px_30px_rgba(109,74,255,0.28)] disabled:opacity-60"
          >
            {state === "uploading" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : photos.length === 0 ? (
              <Camera className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            {state === "uploading"
              ? "Envoi en cours…"
              : photos.length === 0
                ? "Prendre une photo"
                : "Ajouter une autre page"}
          </button>

          {photos.length > 0 && (
            <p className="mt-4 flex items-center gap-1.5 text-[13px] text-purple">
              <CircleCheck className="h-4 w-4" />
              Reçu sur ton ordinateur
            </p>
          )}
        </>
      )}

      {(state === "invalid" || state === "error") && (
        <>
          <CircleAlert className="h-10 w-10 text-red-500" />
          <p className="mt-3 max-w-[300px] text-[14px] text-text-secondary">
            {state === "invalid"
              ? "Ce code a expiré ou n'existe plus. Régénère-en un depuis ton ordinateur."
              : error}
          </p>
        </>
      )}
    </div>
  );
}
