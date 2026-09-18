import { Link } from "react-router-dom";

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link to={to} className={`shrink-0 ${className ?? ""}`}>
      <img
        src="/logo.webp"
        alt="Skoolz"
        width={360}
        height={120}
        className="h-[22px] w-auto sm:h-[25px] xl:h-[28px]"
      />
    </Link>
  );
}
