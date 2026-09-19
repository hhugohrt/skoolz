import { useEffect, useRef, useState } from "react";
import { Camera, Check, X } from "lucide-react";

interface CameraCaptureProps {
  count: number;
  onCapture: (file: File) => void;
  onClose: () => void;
  // Appareil photo indisponible ou refusé : on propose celui du téléphone (une photo à la fois).
  onFallback: () => void;
}

const MAX_SIDE = 2200;

export function isLiveCameraSupported(): boolean {
  return typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
}

// Appareil photo intégré : on prend autant de photos qu'on veut d'affilée, sans quitter l'écran.
export function CameraCapture({ count, onCapture, onClose, onFallback }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [flash, setFlash] = useState(false);
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 2560 }, height: { ideal: 1920 } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.play().then(() => setReady(true)).catch(() => setReady(true));
        }
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => () => {
    if (lastUrl) URL.revokeObjectURL(lastUrl);
  }, [lastUrl]);

  function shoot() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const ratio = Math.min(1, MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * ratio);
    canvas.height = Math.round(video.videoHeight * ratio);
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        setLastUrl(URL.createObjectURL(blob));
        setFlash(true);
        setTimeout(() => setFlash(false), 120);
        onCapture(file);
      },
      "image/jpeg",
      0.9,
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label="Appareil photo">
      <div className="flex items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] text-white">
        <button type="button" onClick={onClose} aria-label="Fermer l'appareil photo" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
          <X className="h-5 w-5" />
        </button>
        <p className="text-[14px] font-semibold">{count === 0 ? "Cadre ta page" : `${count} photo${count > 1 ? "s" : ""}`}</p>
        <button
          type="button"
          onClick={onClose}
          disabled={count === 0}
          className="flex h-11 items-center gap-1.5 rounded-full bg-purple px-4 text-[14px] font-semibold text-white disabled:opacity-40"
        >
          <Check className="h-4 w-4" /> Terminé
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        {failed ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center text-white">
            <Camera className="h-10 w-10 opacity-70" />
            <p className="text-[15px]">L&rsquo;appareil photo n&rsquo;est pas accessible (autorisation refusée ?).</p>
            <button type="button" onClick={onFallback} className="rounded-full bg-white px-5 py-3 text-[15px] font-semibold text-black">
              Utiliser l&rsquo;appareil photo du téléphone
            </button>
          </div>
        ) : (
          <>
            <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-contain" />
            {!ready && <p className="absolute inset-0 flex items-center justify-center text-[14px] text-white/80">Ouverture de l&rsquo;appareil photo…</p>}
            {flash && <div className="pointer-events-none absolute inset-0 bg-white/70" />}
          </>
        )}
      </div>

      {!failed && (
        <div className="flex items-center justify-between px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          <div className="h-14 w-14 overflow-hidden rounded-[10px] border border-white/30 bg-white/10">
            {lastUrl && <img src={lastUrl} alt="Dernière photo" className="h-full w-full object-cover" />}
          </div>
          <button
            type="button"
            onClick={shoot}
            disabled={!ready}
            aria-label="Prendre la photo"
            className="flex h-[74px] w-[74px] items-center justify-center rounded-full border-4 border-white bg-white/20 disabled:opacity-40"
          >
            <span className="h-[54px] w-[54px] rounded-full bg-white" />
          </button>
          <div className="w-14" />
        </div>
      )}
    </div>
  );
}
