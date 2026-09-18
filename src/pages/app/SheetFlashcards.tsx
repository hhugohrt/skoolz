import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type ApiSheetDetail } from "@/lib/api";

export default function SheetFlashcards() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [sheet, setSheet] = useState<ApiSheetDetail | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  useEffect(() => { if (id) api.getSheet(token!, id).then(({ sheet }) => setSheet(sheet)); }, [id, token]);
  if (!sheet) return <p className="text-[15px] text-text-secondary">Préparation des cartes…</p>;
  const cards = sheet.sections;
  if (!cards.length) return <p className="text-[15px] text-text-secondary">Pas encore de cartes pour cette fiche.</p>;
  const card = cards[index];
  const move = (direction: number) => { setIndex((value) => Math.max(0, Math.min(cards.length - 1, value + direction))); setFlipped(false); };
  return <div className="mx-auto max-w-[720px]"><Link to={`/app/sheets/${id}`} className="text-[14px] font-semibold text-purple hover:underline">← Retour à la fiche</Link><div className="mt-8 flex justify-between text-[13px] font-semibold text-text-secondary"><span>Flashcards · {sheet.title}</span><span>{index + 1}/{cards.length}</span></div><button onClick={() => setFlipped(!flipped)} className="mt-4 flex min-h-[330px] w-full flex-col items-center justify-center rounded-[24px] border border-border/70 bg-white p-8 text-center shadow-[0_18px_60px_rgba(54,44,120,0.08)]"><RotateCcw className="h-5 w-5 text-purple" /><p className="mt-6 text-[13px] font-semibold uppercase tracking-wide text-purple">{flipped ? "Réponse" : "Question"}</p><p className="mt-3 font-display text-[25px] font-bold text-text">{flipped ? card.content : card.title || "Quelle est cette notion ?"}</p><p className="mt-7 text-[13px] text-text-secondary">Clique pour retourner la carte</p></button><div className="mt-5 grid grid-cols-2 gap-3"><button onClick={() => move(-1)} disabled={index === 0} className="rounded-[14px] border border-border bg-white py-3 text-[14px] font-semibold text-text disabled:opacity-40">Précédente</button><button onClick={() => move(1)} disabled={index === cards.length - 1} className="rounded-[14px] bg-purple py-3 text-[14px] font-semibold text-white disabled:opacity-40">Suivante</button></div></div>;
}
