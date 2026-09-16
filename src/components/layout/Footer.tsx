import { ChevronDown, Globe } from "lucide-react";

const links = [
  { label: "À propos", href: "#" },
  { label: "Contact", href: "#" },
  { label: "CGU", href: "#" },
  { label: "Confidentialité", href: "#" },
  { label: "Aide", href: "#" },
];

export function Footer() {
  return (
    <footer className="flex flex-col items-center justify-between gap-3 py-2 text-[13px] text-text-secondary sm:text-[15px] md:flex-row">
      <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-7">
        {links.map((link) => (
          <a key={link.label} href={link.href} className="transition-colors hover:text-text">
            {link.label}
          </a>
        ))}
      </nav>
      <button
        type="button"
        className="flex items-center gap-1.5 transition-colors hover:text-text"
      >
        <Globe className="h-4 w-4" />
        <span>Français</span>
        <ChevronDown className="h-4 w-4" />
      </button>
    </footer>
  );
}
