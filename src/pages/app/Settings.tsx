import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, TriangleAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

const THEME_LABELS: Record<string, string> = {
  light: "Clair",
  dark: "Sombre",
  auto: "Automatique",
};

const CONFIRM_WORD = "SUPPRIMER";

export default function Settings() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteAccount() {
    setDeleting(true);
    setError(null);
    try {
      await api.deleteAccount(token!, CONFIRM_WORD);
      // On navigue avant de se déconnecter : sinon la page protégée redirige vers /login au passage.
      navigate("/", { replace: true });
      logout();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de supprimer le compte pour le moment.");
      setDeleting(false);
    }
  }

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

        <div className="rounded-[14px] border border-red-200 bg-red-50/50 p-5">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-red-600">Supprimer mon compte</p>
          <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
            Ton compte, tes cours, tes photos et toutes tes fiches seront définitivement effacés. Cette action est
            irréversible.
          </p>

          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-4 rounded-full border border-red-300 bg-white px-5 py-2.5 text-[14px] font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Supprimer mon compte
            </button>
          ) : (
            <div className="mt-4">
              <p className="flex items-start gap-2 text-[14px] font-semibold text-red-600">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                Pour confirmer, écris « {CONFIRM_WORD} » ci-dessous.
              </p>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                aria-label="Confirmation de suppression"
                className="mt-2 w-full max-w-[280px] rounded-[10px] border border-red-300 bg-white px-3 py-2 text-[15px] text-text outline-none focus:border-red-500"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={deleteAccount}
                  disabled={typed !== CONFIRM_WORD || deleting}
                  className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Supprimer définitivement
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false);
                    setTyped("");
                    setError(null);
                  }}
                  disabled={deleting}
                  className="rounded-full border border-border bg-white px-5 py-2.5 text-[14px] font-semibold text-text transition-colors hover:border-purple/40"
                >
                  Annuler
                </button>
              </div>
              {error && <p className="mt-3 text-[14px] text-red-600">{error}</p>}
            </div>
          )}
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
