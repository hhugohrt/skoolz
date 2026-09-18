import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone, Loader2, CircleAlert, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, type ApiSessionPhoto } from "@/lib/api";
import type { SheetLayout } from "@/lib/sheetStyles";
import { Modal } from "@/components/ui/Modal";

type State = "loading" | "waiting" | "review" | "importing" | "expired" | "error";

export function QrCourseImportButton({ layout, onImported }: { layout: SheetLayout; onImported?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-[14px] font-semibold text-text transition-colors hover:border-purple/40 lg:inline-flex"
      >
        <Smartphone className="h-4 w-4 text-purple" strokeWidth={2} />
        Importer depuis ton téléphone
      </button>

      {open && <QrCourseImportModal layout={layout} onClose={() => setOpen(false)} onImported={onImported} />}
    </>
  );
}

interface Thumbnail extends ApiSessionPhoto {
  url: string;
}

function QrCourseImportModal({
  layout,
  onClose,
  onImported,
}: {
  layout: SheetLayout;
  onClose: () => void;
  onImported?: () => void;
}) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<State>("loading");
  const [mobileUrl, setMobileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [retryKey, setRetryKey] = useState(0);
  const sessionIdRef = useRef<string | null>(null);
  const thumbnailsRef = useRef<Thumbnail[]>([]);

  useEffect(() => {
    thumbnailsRef.current = thumbnails;
  }, [thumbnails]);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function loadThumbnails(sessionId: string, photos: ApiSessionPhoto[]) {
      const known = new Map(thumbnailsRef.current.map((t) => [t.id, t]));
      const next: Thumbnail[] = [];
      for (const photo of photos) {
        const existing = known.get(photo.id);
        if (existing) {
          next.push(existing);
          continue;
        }
        const blob = await api.getUploadSessionPhotoBlob(token!, sessionId, photo.id);
        next.push({ ...photo, url: URL.createObjectURL(blob) });
      }
      return next;
    }

    async function pollOnce(sessionId: string) {
      const { status, photoCount } = await api.getUploadSessionStatus(sessionId);
      if (cancelled) return;

      if (status === "expired") {
        if (intervalId) clearInterval(intervalId);
        setState("expired");
        return;
      }

      if (photoCount !== thumbnailsRef.current.length) {
        const { photos } = await api.listUploadSessionPhotos(token!, sessionId);
        if (cancelled) return;
        const next = await loadThumbnails(sessionId, photos);
        if (cancelled) return;
        setThumbnails(next);
      }

      if (photoCount > 0) {
        setState((s) => (s === "importing" ? s : "review"));
      }
    }

    async function run() {
      setState("loading");
      setError(null);
      setMobileUrl(null);
      setThumbnails([]);
      thumbnailsRef.current = [];

      let sessionId: string;
      let lanIp: string | null;
      try {
        const created = await api.createUploadSession(token!);
        sessionId = created.sessionId;
        lanIp = created.lanIp;
      } catch (err) {
        if (cancelled) return;
        setState("error");
        setError(err instanceof ApiError ? err.message : "Impossible de générer le code.");
        return;
      }
      if (cancelled) return;
      sessionIdRef.current = sessionId;

      // En production (ou déjà sur une IP réseau en dev), la page est atteignable telle quelle :
      // pas besoin de l'IP locale du serveur, on pointe directement sur l'origine courante.
      // Seul le cas "localhost" (dev sur le PC lui-même) a besoin de l'IP locale détectée côté backend,
      // car "localhost" depuis le téléphone désignerait le téléphone lui-même.
      if (window.location.hostname !== "localhost") {
        setMobileUrl(`${window.location.origin}/m/${sessionId}`);
        setState("waiting");
      } else if (lanIp) {
        setMobileUrl(`http://${lanIp}:${window.location.port}/m/${sessionId}`);
        setState("waiting");
      } else {
        setState("error");
        setError(
          "Impossible de détecter l'adresse réseau du serveur. Vérifie que ton PC et ton téléphone sont sur le même Wi-Fi.",
        );
        return;
      }

      intervalId = setInterval(() => {
        pollOnce(sessionId).catch(() => {
          // on retente au prochain tick
        });
      }, 2000);
    }

    run();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey]);

  async function handleReset() {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;
    try {
      await api.resetUploadSession(token!, sessionId);
      thumbnails.forEach((t) => URL.revokeObjectURL(t.url));
      setThumbnails([]);
      thumbnailsRef.current = [];
      setState("waiting");
    } catch {
      setError("Impossible de recommencer, réessaie.");
    }
  }

  async function handleUsePhotos() {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;
    setState("importing");
    try {
      const { course } = await api.importUploadSession(token!, sessionId);
      const { sheetId, suggestedSubject } = await api.generateSheet(token!, course.id);
      onImported?.();
      navigate(`/app/sheets/${sheetId}`, { state: { layout, suggestedSubject, justGenerated: true } });
    } catch (err) {
      setState("error");
      setError(err instanceof ApiError ? err.message : "Impossible de générer la fiche.");
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="font-display text-[20px] font-bold text-text">Importer depuis ton téléphone</h2>
      <p className="mt-1 text-[14px] text-text-secondary">
        {state === "review"
          ? "Ajoute d'autres pages si besoin, ou lance la génération de la fiche."
          : "Scanne ce code avec ton téléphone, prends une ou plusieurs photos de ton cours."}
      </p>

      <div className="mt-6 flex flex-col items-center justify-center">
        {state === "loading" && <Loader2 className="h-8 w-8 animate-spin text-purple" />}

        {state === "waiting" && mobileUrl && (
          <>
            <div className="rounded-[16px] border border-border bg-white p-4">
              <QRCodeSVG value={mobileUrl} size={180} />
            </div>
            <p className="mt-4 flex items-center gap-2 text-[13px] text-text-secondary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              En attente de ta photo…
            </p>
            <p className="mt-2 text-center text-[12px] text-text-secondary">
              Ton téléphone doit être sur le même Wi-Fi que cet ordinateur.
            </p>
          </>
        )}

        {state === "review" && (
          <>
            <div className="grid w-full grid-cols-3 gap-2.5">
              {thumbnails.map((t) => (
                <div key={t.id} className="aspect-[3/4] overflow-hidden rounded-[10px] border border-border bg-surface-2">
                  <img src={t.url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-2 text-[13px] text-text-secondary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {thumbnails.length} photo{thumbnails.length > 1 ? "s" : ""} reçue{thumbnails.length > 1 ? "s" : ""} — tu
              peux continuer à en envoyer depuis ton téléphone
            </p>

            <div className="mt-5 flex w-full gap-2.5">
              <button
                type="button"
                onClick={handleReset}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-white px-4 py-2.5 text-[14px] font-semibold text-text transition-colors hover:border-purple/40"
              >
                <RotateCcw className="h-4 w-4" />
                Recommencer
              </button>
              <button
                type="button"
                onClick={handleUsePhotos}
                className="flex-1 rounded-full bg-purple px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:brightness-105"
              >
                Utiliser {thumbnails.length > 1 ? "ces photos" : "cette photo"}
              </button>
            </div>
          </>
        )}

        {state === "importing" && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-purple" />
            <p className="mt-3 text-[14px] font-semibold text-text">
              Je prépare ta fiche…
            </p>
          </>
        )}

        {(state === "expired" || state === "error") && (
          <>
            <CircleAlert className="h-8 w-8 text-red-500" />
            <p className="mt-3 text-center text-[14px] text-text-secondary">
              {state === "expired" ? "Ce code a expiré." : error}
            </p>
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              className="mt-4 rounded-full bg-purple px-5 py-2.5 text-[14px] font-semibold text-white"
            >
              Générer un nouveau code
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
