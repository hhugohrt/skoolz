import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type AdminOverview } from "@/lib/api";

function Stat({ label, value, hint, tone }: { label: string; value: number | string; hint?: string; tone?: "warn" }) {
  return (
    <div className="rounded-[14px] border border-border/60 bg-white p-4">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary">{label}</p>
      <p className={`mt-1 font-display text-[28px] font-bold ${tone === "warn" ? "text-red-500" : "text-text"}`}>{value}</p>
      {hint && <p className="text-[12px] text-text-secondary">{hint}</p>}
    </div>
  );
}

function Bars({ title, data, color }: { title: string; data: { day: string; value: number }[]; color: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="rounded-[14px] border border-border/60 bg-white p-4">
      <p className="text-[14px] font-semibold text-text">{title}</p>
      <div className="mt-3 flex h-28 items-end gap-1.5" role="img" aria-label={title}>
        {data.map((d) => (
          <div key={d.day} className="group relative flex h-full flex-1 items-end">
            <div
              className="w-full rounded-t-[4px]"
              style={{ height: `${Math.max(d.value > 0 ? 6 : 2, (d.value / max) * 100)}%`, background: color, opacity: d.value > 0 ? 1 : 0.25 }}
            />
            <span className="pointer-events-none absolute -top-6 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-text px-1.5 py-0.5 text-[11px] text-white group-hover:block">
              {new Date(d.day).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} : {d.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-text-secondary">
        <span>{new Date(data[0].day).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
        <span>Aujourd&rsquo;hui</span>
      </div>
    </div>
  );
}

export function AdminOverviewTab() {
  const { token } = useAuth();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.adminOverview(token!).then(setData).catch(() => setError(true));
  }, [token]);

  if (error) return <p className="text-[15px] text-red-500">Impossible de charger les statistiques.</p>;
  if (!data) return <p className="text-[15px] text-text-secondary">Chargement…</p>;

  const pct = (n: number) => (data.users > 0 ? `${Math.round((n / data.users) * 100)} %` : "—");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Utilisateurs" value={data.users} hint={`+${data.new24h} en 24 h · +${data.new7d} en 7 j`} />
        <Stat label="Abonnés" value={data.premium} hint={`${pct(data.premium)} des comptes`} />
        <Stat label="E-mail confirmé" value={data.verified} hint={pct(data.verified)} />
        <Stat label="Onboarding terminé" value={data.onboarded} hint={pct(data.onboarded)} />
        <Stat label="Cours importés" value={data.courses} />
        <Stat label="Fiches créées" value={data.sheets} />
        <Stat label="Générations 24 h" value={data.gens24h} hint={`${data.gens7d} sur 7 jours`} />
        <Stat label="Générations en échec" value={data.failed} tone={data.failed > 0 ? "warn" : undefined} hint="cours au statut « échec »" />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Bars title="Inscriptions (14 jours)" data={data.series.map((s) => ({ day: s.day, value: s.signups }))} color="#6d4aff" />
        <Bars title="Générations de fiches (14 jours)" data={data.series.map((s) => ({ day: s.day, value: s.generations }))} color="#f59e0b" />
      </div>
    </div>
  );
}
