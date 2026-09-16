import { Link } from "react-router-dom";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/signup" className={`shrink-0 ${className ?? ""}`}>
      <img
        src="/logo.png"
        alt="Skoolz"
        className="h-[22px] w-auto sm:h-[25px] xl:h-[28px]"
      />
    </Link>
  );
}
