import { useState } from "react";
import { Navigate } from "react-router-dom";
import { BookOpen, LayoutDashboard, Server, Tags, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AdminOverviewTab } from "@/components/admin/AdminOverviewTab";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminCoursesTab } from "@/components/admin/AdminCoursesTab";
import { AdminSubjectsTab } from "@/components/admin/AdminSubjectsTab";
import { AdminSystemTab } from "@/components/admin/AdminSystemTab";

const TABS = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "courses", label: "Cours et fiches", icon: BookOpen },
  { id: "subjects", label: "Matières", icon: Tags },
  { id: "system", label: "Système", icon: Server },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabId>("overview");

  if (!user?.isAdmin) return <Navigate to="/app" replace />;

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold text-text sm:text-[30px]">Administration</h1>
      <p className="mt-1 text-[14px] text-text-secondary">Gère les utilisateurs, les contenus et l&rsquo;état de Skoolz.</p>

      <div role="tablist" className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[14px] font-semibold transition-colors ${
                active
                  ? "border-purple bg-purple text-white"
                  : "border-border bg-white text-text-secondary hover:border-purple/40 hover:text-text"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tab === "overview" && <AdminOverviewTab />}
        {tab === "users" && <AdminUsersTab />}
        {tab === "courses" && <AdminCoursesTab />}
        {tab === "subjects" && <AdminSubjectsTab />}
        {tab === "system" && <AdminSystemTab />}
      </div>
    </div>
  );
}
