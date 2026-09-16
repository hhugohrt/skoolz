import { NavLink } from "react-router-dom";
import { Home, BookOpen, FileText, GraduationCap, User } from "lucide-react";

const NAV_ITEMS = [
  { to: "/app", label: "Accueil", icon: Home, end: true },
  { to: "/app/courses", label: "Cours", icon: BookOpen },
  { to: "/app/sheets", label: "Fiches", icon: FileText },
  { to: "/app/revise", label: "Réviser", icon: GraduationCap },
  { to: "/app/profile", label: "Profil", icon: User },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-[24px] border border-white/60 bg-white/90 p-2 shadow-[0_18px_50px_rgba(54,44,120,0.12)] backdrop-blur-md lg:hidden">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              isActive ? "bg-purple/10 text-purple" : "text-text-secondary"
            }`
          }
          title={item.label}
        >
          <item.icon className="h-5 w-5" strokeWidth={2} />
        </NavLink>
      ))}
    </nav>
  );
}
