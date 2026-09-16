import { EmptyState } from "@/components/ui/EmptyState";

export default function Revise() {
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold text-text sm:text-[30px]">Réviser</h1>

      <div className="mt-6">
        <EmptyState
          title="La révision personnalisée arrive bientôt"
          description="Quiz, flashcards et sessions adaptées à tes points faibles seront bientôt disponibles ici."
        />
      </div>
    </div>
  );
}
