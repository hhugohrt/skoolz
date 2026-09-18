import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, Pencil, Plus, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, type ApiSubject, type Level } from "@/lib/api";

const LEVEL_LABELS: Record<Level, string> = {
  "3e": "3e",
  seconde: "Seconde",
  premiere: "Première",
  terminale: "Terminale",
  superieur: "Études supérieures",
};
const LEVELS = Object.keys(LEVEL_LABELS) as Level[];

const chip = (active: boolean) =>
  `rounded-full border px-4 py-2 text-[14px] font-medium transition-colors ${
    active ? "border-purple bg-purple text-white" : "border-border bg-white text-text hover:border-purple/40"
  }`;

export default function Profile() {
  const { user, token, setUser } = useAuth();
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [sheetCount, setSheetCount] = useState<number | null>(null);
  const [allSubjects, setAllSubjects] = useState<ApiSubject[]>([]);
  const [subjectIds, setSubjectIds] = useState<string[]>([]);

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [level, setLevel] = useState<Level | null>(null);
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const [customName, setCustomName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listCourses(token!).then(({ courses }) => setCourseCount(courses.length));
    api.listSheets(token!).then(({ sheets }) => setSheetCount(sheets.length));
    Promise.all([api.listSubjects(token!), api.getMySubjectIds(token!)]).then(([{ subjects }, { subjectIds }]) => {
      setAllSubjects(subjects);
      setSubjectIds(subjectIds);
    });
  }, [token]);

  if (!user) return null;

  const initials = user.firstName.slice(0, 2).toUpperCase();
  const mySubjects = allSubjects.filter((s) => subjectIds.includes(s.id));
  // Matières communes + celles que l'élève a déjà choisies (dont les siennes).
  const choices = allSubjects.filter((s) => !s.isCustom || draftIds.includes(s.id) || subjectIds.includes(s.id));

  function startEdit() {
    setFirstName(user!.firstName);
    setLevel(user!.level);
    setDraftIds(subjectIds);
    setCustomName("");
    setError(null);
    setEditing(true);
  }

  function toggle(id: string) {
    setDraftIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function addCustom() {
    const name = customName.trim();
    if (!name) return;
    try {
      const { subject } = await api.createSubject(token!, name);
      setAllSubjects((prev) => (prev.some((s) => s.id === subject.id) ? prev : [...prev, subject]));
      setDraftIds((prev) => (prev.includes(subject.id) ? prev : [...prev, subject.id]));
      setCustomName("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'ajouter cette matière.");
    }
  }

  async function save() {
    if (!firstName.trim()) {
      setError("Le prénom est obligatoire.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { user: updated } = await api.updateProfile(token!, {
        firstName: firstName.trim(),
        ...(level ? { level } : {}),
        subjectIds: draftIds,
      });
      setUser(updated);
      setSubjectIds(draftIds);
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer pour le moment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-[26px] font-bold text-text sm:text-[30px]">Profil</h1>
        <Link
          to="/app/settings"
          className="flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-[14px] font-semibold text-text-secondary transition-colors hover:text-text lg:hidden"
        >
          <SettingsIcon className="h-4 w-4" /> Paramètres
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-4 rounded-[20px] border border-border/60 bg-white p-5 sm:p-6">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-purple text-[20px] font-bold text-white">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[18px] font-semibold text-text">{user.firstName}</p>
          <p className="truncate text-[14px] text-text-secondary">{user.email}</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={startEdit}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-purple/[0.09] px-4 py-2 text-[14px] font-semibold text-purple transition-colors hover:bg-purple/[0.15]"
          >
            <Pencil className="h-4 w-4" /> <span className="hidden sm:inline">Modifier le profil</span>
            <span className="sm:hidden">Modifier</span>
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-4 flex flex-col gap-5 rounded-[20px] border border-purple/30 bg-white p-5 sm:p-6">
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Prénom</span>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              maxLength={50}
              className="h-12 rounded-[12px] border border-border bg-white px-4 text-[16px] text-text outline-none focus:border-purple"
            />
          </label>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Niveau</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <button key={l} type="button" onClick={() => setLevel(l)} className={chip(level === l)}>
                  {LEVEL_LABELS[l]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Matières</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {choices.map((s) => (
                <button key={s.id} type="button" onClick={() => toggle(s.id)} className={chip(draftIds.includes(s.id))}>
                  {s.name}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
                placeholder="Ajouter une autre matière"
                maxLength={60}
                className="h-11 min-w-0 flex-1 rounded-[12px] border border-border bg-white px-4 text-[15px] text-text outline-none focus:border-purple"
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!customName.trim()}
                aria-label="Ajouter la matière"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-purple/10 text-purple disabled:opacity-40"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {error && <p className="text-[14px] text-red-500">{error}</p>}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={saving}
              className="h-12 rounded-full border border-border px-6 text-[15px] font-semibold text-text-secondary"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-purple px-6 text-[15px] font-semibold text-white disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Enregistrer
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-[14px] border border-border/60 bg-white p-5">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Niveau</p>
            <p className="mt-1 text-[16px] font-semibold text-text">
              {user.level ? LEVEL_LABELS[user.level] : "Non renseigné"}
            </p>
          </div>
          <div className="rounded-[14px] border border-border/60 bg-white p-5">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Matières</p>
            <p className="mt-1 text-[15px] text-text">
              {mySubjects.length > 0 ? mySubjects.map((s) => s.name).join(", ") : "Aucune matière sélectionnée"}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-[14px] border border-border/60 bg-white p-5 text-center">
          <p className="font-display text-[28px] font-bold text-text">{courseCount ?? "—"}</p>
          <p className="text-[13px] text-text-secondary">Cours importés</p>
        </div>
        <div className="rounded-[14px] border border-border/60 bg-white p-5 text-center">
          <p className="font-display text-[28px] font-bold text-text">{sheetCount ?? "—"}</p>
          <p className="text-[13px] text-text-secondary">Fiches créées</p>
        </div>
      </div>
    </div>
  );
}
