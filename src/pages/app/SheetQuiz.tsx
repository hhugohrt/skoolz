import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type ApiSheetDetail } from "@/lib/api";
import { LockedNotice } from "@/components/billing/LockedArea";

export default function SheetQuiz() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [sheet, setSheet] = useState<ApiSheetDetail | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    if (id) api.getSheet(token!, id).then(({ sheet }) => setSheet(sheet));
  }, [id, token]);

  const questions = useMemo(() => sheet?.sections.slice(0, 8) ?? [], [sheet]);
  if (sheet?.locked)
    return (
      <div className="mx-auto max-w-[720px]">
        <Link to={`/app/sheets/${id}`} className="text-[14px] font-semibold text-purple hover:underline">← Retour à la fiche</Link>
        <LockedNotice />
      </div>
    );
  if (!sheet) return <p className="text-[15px] text-text-secondary">Chargement du quiz…</p>;
  if (!questions.length) return <p className="text-[15px] text-text-secondary">Cette fiche ne contient pas assez de notions.</p>;
  const done = index >= questions.length;
  const question = questions[Math.min(index, questions.length - 1)];

  function answer(isCorrect: boolean) {
    if (isCorrect) setCorrect((value) => value + 1);
    setRevealed(true);
  }
  function next() {
    setIndex((value) => value + 1);
    setRevealed(false);
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <Link to={`/app/sheets/${id}`} className="text-[14px] font-semibold text-purple hover:underline">← Retour à la fiche</Link>
      {done ? (
        <div className="mt-8 rounded-[20px] border border-border/60 bg-white p-8 text-center shadow-[0_18px_60px_rgba(54,44,120,0.06)]">
          <CheckCircle2 className="mx-auto h-10 w-10 text-purple" />
          <h1 className="mt-4 font-display text-[28px] font-bold text-text">Bien joué. {correct}/{questions.length}, c’est solide.</h1>
          <p className="mt-2 text-text-secondary">Refais-le demain pour ancrer les notions.</p>
          <button onClick={() => { setIndex(0); setCorrect(0); }} className="mt-6 rounded-[14px] bg-cta-gradient px-5 py-3 text-[14px] font-semibold text-white">Recommencer</button>
        </div>
      ) : (
        <div className="mt-8 rounded-[20px] border border-border/60 bg-white p-6 shadow-[0_18px_60px_rgba(54,44,120,0.06)] sm:p-8">
          <div className="flex items-center justify-between text-[13px] font-semibold text-text-secondary"><span>Quiz · {sheet.title}</span><span>{index + 1}/{questions.length}</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-cta-gradient transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
          <p className="mt-8 text-[13px] font-semibold uppercase tracking-wide text-purple">{question.title || "Notion clé"}</p>
          <h1 className="mt-2 font-display text-[25px] font-bold text-text">Tu maîtrises cette notion ?</h1>
          {!revealed ? <div className="mt-7 grid gap-3 sm:grid-cols-2"><button onClick={() => answer(true)} className="rounded-[14px] bg-purple px-5 py-4 text-[15px] font-semibold text-white">Oui, je l’ai</button><button onClick={() => answer(false)} className="rounded-[14px] border border-border bg-surface-2 px-5 py-4 text-[15px] font-semibold text-text">Pas encore</button></div> : <div className="mt-6"><div className="rounded-[14px] bg-purple/5 p-5 text-[15px] leading-relaxed text-text-secondary whitespace-pre-line">{question.content}</div><button onClick={next} className="mt-5 flex w-full items-center justify-center gap-2 rounded-[14px] bg-cta-gradient px-5 py-3.5 text-[15px] font-semibold text-white">Question suivante <ChevronRight className="h-4 w-4" /></button></div>}
        </div>
      )}
    </div>
  );
}
