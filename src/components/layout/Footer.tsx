import { Link } from "react-router-dom";
import { ChevronDown, Globe } from "lucide-react";
import { LEGAL } from "@/lib/legal";

export function Footer() {
  return (
    <footer className="flex flex-col items-center justify-between gap-3 py-2 text-[13px] text-text-secondary sm:text-[15px] md:flex-row">
      <nav aria-label="Liens légaux" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-7">
        <Link to="/mentions-legales" className="transition-colors hover:text-text">
          Mentions légales
        </Link>
        <Link to="/cgu" className="transition-colors hover:text-text">
          CGU
        </Link>
        <Link to="/confidentialite" className="transition-colors hover:text-text">
          Confidentialité
        </Link>
        {LEGAL.contactEmail ? (
          <a href={`mailto:${LEGAL.contactEmail}`} className="transition-colors hover:text-text">
            Contact
          </a>
        ) : (
          <Link to="/mentions-legales#contact" className="transition-colors hover:text-text">
            Contact
          </Link>
        )}
        <a href="/#faq" className="transition-colors hover:text-text">
          Aide
        </a>
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
