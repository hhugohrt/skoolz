import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, BookOpen, GraduationCap, User, Settings, LogOut, Menu, X, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { PricingModal } from "@/components/billing/PricingModal";

const NAV_ITEMS = [
  { to: "/app", label: "Accueil", icon: Home, end: true },
  { to: "/app/courses", label: "Cours", icon: BookOpen },
  { to: "/app/revise", label: "Réviser", icon: GraduationCap },
  { to: "/app/profile", label: "Profil", icon: User },
  { to: "/app/settings", label: "Paramètres", icon: Settings },
];

// Mobile / tablette : barre du haut avec le menu « burger » qui ouvre un panneau latéral.
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-white/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-md sm:px-6 lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="flex h-11 w-11 items-center justify-center rounded-full text-text transition-colors hover:bg-purple/10"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      <div className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <nav
          id="mobile-menu"
          aria-label="Navigation principale"
          className={`absolute right-0 top-0 flex h-full w-[82%] max-w-[320px] flex-col bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] transition-transform duration-200 ${
            open ? "translate-x-0 shadow-2xl" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="min-w-0 truncate text-[15px] font-semibold text-text">
              {user ? `Salut ${user.firstName} 👋` : "Menu"}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-purple/10"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <ul className="mt-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  tabIndex={open ? 0 : -1}
                  className={({ isActive }) =>
                    `flex min-h-[52px] items-center gap-3 rounded-[14px] px-4 text-[16px] font-semibold transition-colors ${
                      isActive ? "bg-purple/10 text-purple" : "text-text hover:bg-surface-2"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" strokeWidth={2} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setPlansOpen(true);
            }}
            tabIndex={open ? 0 : -1}
            className="mt-1 flex min-h-[52px] items-center gap-3 rounded-[14px] px-4 text-[16px] font-semibold text-purple transition-colors hover:bg-purple/10"
          >
            <Sparkles className="h-5 w-5" strokeWidth={2} />
            Plans
          </button>

          <button
            type="button"
            onClick={logout}
            tabIndex={open ? 0 : -1}
            className="mt-auto flex min-h-[52px] items-center gap-3 rounded-[14px] px-4 text-[16px] font-semibold text-text-secondary transition-colors hover:bg-surface-2"
          >
            <LogOut className="h-5 w-5" strokeWidth={2} />
            Se déconnecter
          </button>
        </nav>
      </div>
      {plansOpen && <PricingModal onClose={() => setPlansOpen(false)} />}
    </>
  );
}
