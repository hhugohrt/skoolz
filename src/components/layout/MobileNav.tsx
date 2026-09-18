import { NavLink } from "react-router-dom";
import { Home, BookOpen, GraduationCap, User } from "lucide-react";

const NAV_ITEMS = [
  { to: "/app", label: "Accueil", icon: Home, end: true },
  { to: "/app/courses", label: "Cours", icon: BookOpen },
  { to: "/app/revise", label: "Réviser", icon: GraduationCap },
  { to: "/app/profile", label: "Profil", icon: User },
];

// Barre du bas pleine largeur, icônes + libellés : zones de toucher confortables, respecte l'encoche iPhone.
export function MobileNav() {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(54,44,120,0.08)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto flex max-w-[520px] items-stretch justify-around px-2">
        {NAV_ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-[14px] text-[11px] font-semibold transition-colors ${
                  isActive ? "text-purple" : "text-text-secondary"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                      isActive ? "bg-purple/10" : ""
                    }`}
                  >
                    <item.icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
