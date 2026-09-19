import { useEffect, useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type AdminSystem } from "@/lib/api";

export function AdminSystemTab() {
  const { token } = useAuth();
  const [data, setData] = useState<AdminSystem | null>(null);

  useEffect(() => {
    api.adminSystem(token!).then(setData).catch(() => {});
  }, [token]);

  if (!data) return <p className="text-[15px] text-text-secondary">Chargement…</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-[14px] border border-border/60 bg-white">
        <ul className="divide-y divide-border/60">
          {data.services.map((s) => (
            <li key={s.name} className="flex items-center gap-3 px-4 py-3">
              {s.ok ? <CircleCheck className="h-5 w-5 shrink-0 text-emerald-600" /> : <CircleAlert className="h-5 w-5 shrink-0 text-amber-500" />}
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-text">{s.name}</span>
                <span className="block truncate text-[12px] text-text-secondary">{s.detail}</span>
              </span>
              <span className={`shrink-0 text-[12px] font-semibold ${s.ok ? "text-emerald-700" : "text-amber-600"}`}>{s.ok ? "OK" : "À configurer"}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-[14px] border border-border/60 bg-white p-4">
        <p className="text-[14px] font-semibold text-text">Limites de génération (par 24 h)</p>
        <p className="mt-1 text-[14px] text-text-secondary">
          Abonnés : {data.limits.premiumDaily} · Comptes gratuits : {data.limits.freeDaily}
        </p>
        <p className="mt-2 text-[12px] text-text-secondary">
          Ces valeurs se changent avec les variables <code>DAILY_GENERATION_LIMIT</code> et <code>FREE_DAILY_GENERATIONS</code> sur Vercel (projet skoolz-api).
        </p>
      </div>
    </div>
  );
}
