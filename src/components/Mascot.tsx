interface MascotProps {
  className?: string;
  src?: string;
}

export function Mascot({ className, src = "/mascot-login.png" }: MascotProps) {
  return (
    <img
      src={src}
      alt="Mascotte Skoolz"
      className={`pointer-events-none select-none object-contain ${className ?? ""}`}
    />
  );
}
