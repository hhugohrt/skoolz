import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, BookOpen, GraduationCap, User, Settings, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { to: "/app", label: "Accueil", icon: Home, end: true },
  { to: "/app/courses", label: "Cours", icon: BookOpen },
  { to: "/app/revise", label: "Réviser", icon: GraduationCap },
  { to: "/app/profile", label: "Profil", icon: User },
];

import { PricingModal } from "@/components/billing/PricingModal";

export function Sidebar() {
  const [plansOpen, setPlansOpen] = useState(false);
  return (
    <>
    <nav className="fixed left-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-1 rounded-[28px] border border-white/60 bg-white/80 p-3 shadow-[0_18px_50px_rgba(54,44,120,0.12)] backdrop-blur-md lg:flex">
      <div className="flex flex-col items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `group relative flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                isActive ? "bg-purple/10 text-purple" : "text-text-secondary hover:bg-surface-2 hover:text-text"
              }`
            }
            title={item.label}
          >
            <item.icon className="h-5 w-5" strokeWidth={2} />
          </NavLink>
        ))}
      </div>

      <div className="my-1 h-px w-8 bg-border" />

      <button
        type="button"
        onClick={() => setPlansOpen(true)}
        title="Plans"
        aria-label="Voir les plans"
        className="flex h-11 w-11 items-center justify-center rounded-full text-purple transition-colors hover:bg-purple/10"
      >
        <Sparkles className="h-5 w-5" strokeWidth={2} />
      </button>

      <NavLink
        to="/app/settings"
        className={({ isActive }) =>
          `flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
            isActive ? "bg-purple/10 text-purple" : "text-text-secondary hover:bg-surface-2 hover:text-text"
          }`
        }
        title="Paramètres"
      >
        <Settings className="h-5 w-5" strokeWidth={2} />
      </NavLink>
    </nav>
    {plansOpen && <PricingModal onClose={() => setPlansOpen(false)} />}
    </>
  );
}
