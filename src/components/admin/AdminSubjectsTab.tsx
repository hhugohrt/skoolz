import { useCallback, useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, type AdminSubject } from "@/lib/api";

export function AdminSubjectsTab() {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState<AdminSubject[] | null>(null);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api.adminSubjects(token!).then(({ subjects }) => setSubjects(subjects)).catch(() => setSubjects([]));
  }, [token]);
  useEffect(load, [load]);

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action impossible.");
    }
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          run(async () => {
            await api.adminCreateSubject(token!, newName.trim());
            setNewName("");
          });
        }}
        className="flex gap-2"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nouvelle matière commune"
          maxLength={60}
          className="h-11 min-w-0 flex-1 rounded-full border border-border bg-white px-4 text-[15px] text-text outline-none focus:border-purple"
        />
        <button type="submit" disabled={!newName.trim()} className="flex h-11 items-center gap-1.5 rounded-full bg-purple px-5 text-[14px] font-semibold text-white disabled:opacity-40">
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </form>
      {error && <p className="mt-2 text-[13px] text-red-500">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-[14px] border border-border/60 bg-white">
        {subjects === null ? (
          <p className="p-4 text-[14px] text-text-secondary">Chargement…</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {subjects.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                {editingId === s.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={60}
                    className="h-9 min-w-0 flex-1 rounded-full border border-purple bg-white px-3 text-[14px] outline-none"
                  />
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-text">
                      {s.name}
                      {s.isCustom && <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-text-secondary">Perso</span>}
                    </p>
                    <p className="text-[12px] text-text-secondary">
                      {s.courses} cours · {s.users} élève{s.users > 1 ? "s" : ""}
                    </p>
                  </div>
                )}

                {editingId === s.id ? (
                  <span className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      aria-label="Enregistrer"
                      onClick={() =>
                        run(async () => {
                          await api.adminRenameSubject(token!, s.id, editName);
                          setEditingId(null);
                        })
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-full text-purple hover:bg-purple/10"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label="Annuler" onClick={() => setEditingId(null)} className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2">
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ) : confirmId === s.id ? (
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="hidden text-[12px] text-text-secondary sm:inline">Les cours seront « non rangés ».</span>
                    <button
                      type="button"
                      onClick={() =>
                        run(async () => {
                          await api.adminDeleteSubject(token!, s.id);
                          setConfirmId(null);
                        })
                      }
                      className="rounded-full bg-red-600 px-3 py-1.5 text-[12px] font-semibold text-white"
                    >
                      Supprimer
                    </button>
                    <button type="button" onClick={() => setConfirmId(null)} className="rounded-full border border-border px-3 py-1.5 text-[12px] font-semibold text-text">
                      Non
                    </button>
                  </span>
                ) : (
                  <span className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      aria-label={`Renommer ${s.name}`}
                      onClick={() => {
                        setEditingId(s.id);
                        setEditName(s.name);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2 hover:text-text"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Supprimer ${s.name}`}
                      onClick={() => setConfirmId(s.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
