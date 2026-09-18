interface MascotProps {
  className?: string;
  src?: string;
  // À activer pour l'image visible dès l'arrivée sur la page (améliore le LCP).
  priority?: boolean;
}

export function Mascot({ className, src = "/mascot-login.webp", priority = false }: MascotProps) {
  return (
    <img
      src={src}
      alt="Mascotte Skoolz"
      width={760}
      height={520}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
      className={`pointer-events-none select-none object-contain ${className ?? ""}`}
    />
  );
}
