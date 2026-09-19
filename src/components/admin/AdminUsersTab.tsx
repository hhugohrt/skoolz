import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, Crown, Loader2, MailCheck, MailX, Search, Trash2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, type AdminUser } from "@/lib/api";

const PAGE = 25;
const FILTERS = [
  { id: "all", label: "Tous" },
  { id: "premium", label: "Abonnés" },
  { id: "free", label: "Gratuits" },
  { id: "unverified", label: "E-mail non confirmé" },
];

const date = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

function Badge({ children, tone }: { children: React.ReactNode; tone: "purple" | "green" | "amber" | "gray" }) {
  const tones = {
    purple: "bg-purple/10 text-purple",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    gray: "bg-surface-2 text-text-secondary",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

function UserDetail({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const { token, user: me } = useAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof api.adminUser>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(() => {
    api.adminUser(token!, id).then(setData).catch(() => setError("Utilisateur introuvable."));
  }, [token, id]);
  useEffect(load, [load]);

  async function update(patch: Parameters<typeof api.adminUpdateUser>[2]) {
    setBusy(true);
    setError(null);
    try {
      await api.adminUpdateUser(token!, id, patch);
      load();
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Modification impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await api.adminDeleteUser(token!, id);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Suppression impossible.");
      setBusy(false);
    }
  }

  const user = data?.user;
  const isSelf = user?.id === me?.id;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Détail de l'utilisateur">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-[460px] flex-col overflow-y-auto bg-white p-5 shadow-2xl">
        <button type="button" onClick={onClose} className="mb-3 flex w-fit items-center gap-1.5 text-[14px] font-semibold text-purple">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        {!user ? (
          <p className="text-[15px] text-text-secondary">{error ?? "Chargement…"}</p>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple text-[16px] font-bold text-white">
                {user.firstName.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[18px] font-semibold text-text">{user.firstName}</p>
                <p className="truncate text-[13px] text-text-secondary">{user.email}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {user.isPremium ? <Badge tone="purple"><Crown className="h-3 w-3" /> Abonné</Badge> : <Badge tone="gray">Gratuit</Badge>}
              {user.emailVerified ? <Badge tone="green"><MailCheck className="h-3 w-3" /> E-mail confirmé</Badge> : <Badge tone="amber"><MailX className="h-3 w-3" /> E-mail non confirmé</Badge>}
              {user.google && <Badge tone="gray">Google</Badge>}
              {user.isAdmin && <Badge tone="purple"><BadgeCheck className="h-3 w-3" /> Admin</Badge>}
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              <dt className="text-text-secondary">Inscrit le</dt>
              <dd className="text-right font-medium text-text">{date(user.createdAt)}</dd>
              <dt className="text-text-secondary">Niveau</dt>
              <dd className="text-right font-medium text-text">{user.level ?? "—"}</dd>
              <dt className="text-text-secondary">Onboarding</dt>
              <dd className="text-right font-medium text-text">{user.onboardingCompleted ? "Terminé" : "Non terminé"}</dd>
              <dt className="text-text-secondary">Cours / fiches</dt>
              <dd className="text-right font-medium text-text">{user.courses} / {user.sheets}</dd>
              <dt className="text-text-secondary">Générations 24 h</dt>
              <dd className="text-right font-medium text-text">{user.gens24h}</dd>
              {user.whopMembershipId && (
                <>
                  <dt className="text-text-secondary">Abonnement Whop</dt>
                  <dd className="truncate text-right font-medium text-text">{user.whopMembershipId}</dd>
                </>
              )}
            </dl>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => update({ plan: user.plan === "premium" ? "free" : "premium" })}
                className="flex h-11 items-center justify-center gap-2 rounded-[12px] border border-border bg-white text-[14px] font-semibold text-text transition-colors hover:border-purple/40 disabled:opacity-60"
              >
                <Crown className="h-4 w-4 text-purple" />
                {user.plan === "premium" ? "Repasser en gratuit" : "Offrir l'abonnement"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => update({ emailVerified: !user.emailVerified })}
                className="flex h-11 items-center justify-center gap-2 rounded-[12px] border border-border bg-white text-[14px] font-semibold text-text transition-colors hover:border-purple/40 disabled:opacity-60"
              >
                <MailCheck className="h-4 w-4 text-purple" />
                {user.emailVerified ? "Marquer l'e-mail non confirmé" : "Confirmer l'e-mail manuellement"}
              </button>

              {!isSelf && !user.isAdmin &&
                (confirmDelete ? (
                  <div className="rounded-[12px] border border-red-200 bg-red-50 p-3">
                    <p className="text-[13px] text-red-700">Supprimer définitivement ce compte, ses cours, ses fiches et ses photos ?</p>
                    <div className="mt-2 flex gap-2">
                      <button type="button" disabled={busy} onClick={remove} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-red-600 text-[14px] font-semibold text-white disabled:opacity-60">
                        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Supprimer
                      </button>
                      <button type="button" onClick={() => setConfirmDelete(false)} className="h-10 flex-1 rounded-[10px] border border-border bg-white text-[14px] font-semibold text-text">
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex h-11 items-center justify-center gap-2 rounded-[12px] border border-red-200 bg-white text-[14px] font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" /> Supprimer le compte
                  </button>
                ))}
            </div>
            {error && <p className="mt-3 text-[13px] text-red-500">{error}</p>}

            <h3 className="mt-6 text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Derniers cours</h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {data!.courses.length === 0 && <li className="text-[13px] text-text-secondary">Aucun cours.</li>}
              {data!.courses.map((c) => (
                <li key={c.id} className="rounded-[10px] bg-surface-2/60 px-3 py-2 text-[13px]">
                  <p className="truncate font-medium text-text">{c.title}</p>
                  <p className="text-text-secondary">
                    {date(c.createdAt)} · {c.status}
                    {c.errorMessage ? ` · ${c.errorMessage}` : ""}
                  </p>
                </li>
              ))}
            </ul>

            <h3 className="mt-5 text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Dernières fiches</h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {data!.sheets.length === 0 && <li className="text-[13px] text-text-secondary">Aucune fiche.</li>}
              {data!.sheets.map((s) => (
                <li key={s.id} className="truncate rounded-[10px] bg-surface-2/60 px-3 py-2 text-[13px] text-text">
                  {s.title}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-text-secondary">Le contenu détaillé des fiches n&rsquo;est pas affiché ici par respect de la vie privée.</p>
          </>
        )}
      </div>
    </div>
  );
}

export function AdminUsersTab() {
  const { token, user: me } = useAuth();
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<{ total: number; users: AdminUser[] } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  // La recherche part 300 ms après la dernière frappe.
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(q);
      setOffset(0);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(() => {
    api.adminUsers(token!, { q: query, filter, offset }).then(setData).catch(() => setData({ total: 0, users: [] }));
  }, [token, query, filter, offset]);
  useEffect(load, [load]);

  // On ne peut sélectionner ni son propre compte ni un administrateur.
  const selectable = (data?.users ?? []).filter((u) => !u.isAdmin && u.id !== me?.id);
  const allSelected = selectable.length > 0 && selectable.every((u) => selected.includes(u.id));

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setConfirmBulk(false);
  }

  async function deleteSelected() {
    setBulkBusy(true);
    try {
      const { deleted } = await api.adminBulkDeleteUsers(token!, selected);
      setBulkMessage(`${deleted} compte${deleted > 1 ? "s" : ""} supprimé${deleted > 1 ? "s" : ""}.`);
    } catch {
      setBulkMessage("Suppression impossible pour le moment.");
    } finally {
      setSelected([]);
      setConfirmBulk(false);
      setBulkBusy(false);
      load();
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par e-mail ou prénom"
            className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-10 text-[15px] text-text outline-none focus:border-purple"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Effacer" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setFilter(f.id);
              setOffset(0);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              filter === f.id ? "border-purple bg-purple text-white" : "border-border bg-white text-text-secondary hover:border-purple/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {selectable.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px]">
          <label className="flex cursor-pointer items-center gap-2 font-semibold text-text-secondary">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => setSelected(allSelected ? [] : selectable.map((u) => u.id))}
              className="h-4 w-4 accent-[#6d4aff]"
            />
            Tout sélectionner
          </label>
          {selected.length > 0 &&
            (confirmBulk ? (
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-red-600">
                  Supprimer définitivement {selected.length} compte{selected.length > 1 ? "s" : ""} et leurs fiches ?
                </span>
                <button type="button" disabled={bulkBusy} onClick={deleteSelected} className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 font-semibold text-white disabled:opacity-60">
                  {bulkBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Oui, supprimer
                </button>
                <button type="button" onClick={() => setConfirmBulk(false)} className="rounded-full border border-border bg-white px-4 py-1.5 font-semibold text-text">
                  Annuler
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmBulk(true)} className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-1.5 font-semibold text-red-600 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" /> Supprimer la sélection ({selected.length})
              </button>
            ))}
          {bulkMessage && selected.length === 0 && <span className="text-text-secondary">{bulkMessage}</span>}
        </div>
      )}

      <div className="mt-3 overflow-hidden rounded-[14px] border border-border/60 bg-white">
        {data === null ? (
          <p className="p-4 text-[14px] text-text-secondary">Chargement…</p>
        ) : data.users.length === 0 ? (
          <p className="p-4 text-[14px] text-text-secondary">Aucun utilisateur.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {data.users.map((u) => (
              <li key={u.id} className="flex items-center hover:bg-surface-2/50">
                <span className="flex w-11 shrink-0 items-center justify-center pl-3">
                  {u.isAdmin || u.id === me?.id ? (
                    <span className="h-4 w-4" />
                  ) : (
                    <input
                      type="checkbox"
                      checked={selected.includes(u.id)}
                      onChange={() => toggle(u.id)}
                      aria-label={`Sélectionner ${u.email}`}
                      className="h-4 w-4 accent-[#6d4aff]"
                    />
                  )}
                </span>
                <button type="button" onClick={() => setOpenId(u.id)} className="flex min-w-0 flex-1 items-center gap-3 py-3 pr-4 text-left">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple/10 text-[12px] font-bold text-purple">
                    {u.firstName.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-text">{u.firstName}</span>
                    <span className="block truncate text-[12px] text-text-secondary">{u.email}</span>
                  </span>
                  <span className="hidden shrink-0 flex-wrap justify-end gap-1 sm:flex">
                    {u.isPremium && <Badge tone="purple">Abonné</Badge>}
                    {!u.emailVerified && <Badge tone="amber">Non confirmé</Badge>}
                    {u.isAdmin && <Badge tone="purple">Admin</Badge>}
                  </span>
                  <span className="hidden shrink-0 text-right text-[12px] text-text-secondary md:block">
                    {u.sheets} fiche{u.sheets > 1 ? "s" : ""}
                    <br />
                    {date(u.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data && data.total > PAGE && (
        <div className="mt-3 flex items-center justify-between text-[13px] text-text-secondary">
          <span>
            {offset + 1}–{Math.min(offset + PAGE, data.total)} sur {data.total}
          </span>
          <div className="flex gap-2">
            <button type="button" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE))} className="rounded-full border border-border bg-white px-4 py-1.5 font-semibold text-text disabled:opacity-40">
              Précédent
            </button>
            <button type="button" disabled={offset + PAGE >= data.total} onClick={() => setOffset(offset + PAGE)} className="rounded-full border border-border bg-white px-4 py-1.5 font-semibold text-text disabled:opacity-40">
              Suivant
            </button>
          </div>
        </div>
      )}
      {data && <p className="mt-2 text-[12px] text-text-secondary">{data.total} utilisateur{data.total > 1 ? "s" : ""}</p>}

      {openId && <UserDetail id={openId} onClose={() => setOpenId(null)} onChanged={load} />}
    </div>
  );
}
