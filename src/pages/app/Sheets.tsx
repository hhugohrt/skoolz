import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api, type ApiSheetSummary } from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Sheets() {
  const { token } = useAuth();
  const [sheets, setSheets] = useState<ApiSheetSummary[] | null>(null);

  useEffect(() => {
    api.listSheets(token!).then(({ sheets }) => setSheets(sheets));
  }, [token]);

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold text-text sm:text-[30px]">Tes fiches</h1>

      <div className="mt-6">
        {sheets === null ? (
          <p className="text-[15px] text-text-secondary">Chargement…</p>
        ) : sheets.length === 0 ? (
          <EmptyState
            title="Aucune fiche pour l'instant"
            description="Importe un cours depuis l'accueil pour générer ta première fiche."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sheets.map((sheet) => (
              <Link
                key={sheet.id}
                to={`/app/sheets/${sheet.id}`}
                className="flex flex-col rounded-[16px] border border-border/60 bg-white p-5 transition-colors hover:border-purple/40"
              >
                {sheet.subjectName && (
                  <span className="w-fit rounded-full bg-purple/10 px-2.5 py-1 text-[12px] font-semibold text-purple">
                    {sheet.subjectName}
                  </span>
                )}
                <p className="mt-3 text-[16px] font-semibold text-text">{sheet.title}</p>
                <p className="mt-1 line-clamp-2 text-[13px] text-text-secondary">{sheet.summary}</p>
                <p className="mt-3 text-[12px] text-text-secondary">
                  {new Date(sheet.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
