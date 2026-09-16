import { useAuth } from "@/context/AuthContext";

const THEME_LABELS: Record<string, string> = {
  light: "Clair",
  dark: "Sombre",
  auto: "Automatique",
};

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold text-text sm:text-[30px]">Paramètres</h1>

      <div className="mt-6 flex flex-col gap-4">
        <div className="rounded-[14px] border border-border/60 bg-white p-5">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Compte</p>
          <p className="mt-2 text-[15px] text-text">{user?.email}</p>
        </div>

        <div className="rounded-[14px] border border-border/60 bg-white p-5">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Apparence</p>
          <p className="mt-2 text-[15px] text-text">{user ? THEME_LABELS[user.theme] : "—"}</p>
        </div>

        <div className="rounded-[14px] border border-border/60 bg-white p-5">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Sécurité</p>
          <p className="mt-2 text-[15px] text-text-secondary">
            Changement de mot de passe bientôt disponible.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="mt-8 rounded-full bg-purple/[0.09] px-5 py-2.5 text-[15px] font-semibold text-text transition-colors hover:bg-purple/[0.15]"
      >
        Se déconnecter
      </button>
    </div>
  );
}
