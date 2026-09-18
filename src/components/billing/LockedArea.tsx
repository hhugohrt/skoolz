import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { PricingModal } from "@/components/billing/PricingModal";

function UnlockCard({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="w-full max-w-[380px] rounded-[20px] border border-border/60 bg-white p-6 text-center shadow-[0_18px_60px_rgba(54,44,120,0.18)]">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple/10 text-purple">
        <Lock className="h-6 w-6" />
      </span>
      <p className="mt-3 font-display text-[20px] font-bold text-text">Ta fiche est prête</p>
      <p className="mt-1 text-[14px] text-text-secondary">Débloque-la pour la lire, l&rsquo;imprimer et la modifier.</p>
      <button
        type="button"
        onClick={onUnlock}
        className="mt-4 h-[50px] w-full rounded-[14px] bg-purple text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        Débloquer
      </button>
    </div>
  );
}

// Compte gratuit : le contenu (déjà masqué par le serveur) est flouté et recouvert du bouton « Débloquer ».
export function LockedArea({ locked, children }: { locked: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  if (!locked) return <>{children}</>;
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none max-h-[620px] select-none overflow-hidden blur-[7px] [mask-image:linear-gradient(to_bottom,black_75%,transparent)]"
      >
        {children}
      </div>
      <div className="absolute inset-0 flex items-start justify-center px-1 pt-10 sm:pt-16">
        <div className="sticky top-24 w-full max-w-[380px]">
          <UnlockCard onUnlock={() => setOpen(true)} />
        </div>
      </div>
      {open && <PricingModal onClose={() => setOpen(false)} />}
    </div>
  );
}

// Version pleine page pour les écrans sans aperçu (quiz, flashcards).
export function LockedNotice() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-8 flex justify-center">
      <UnlockCard onUnlock={() => setOpen(true)} />
      {open && <PricingModal onClose={() => setOpen(false)} />}
    </div>
  );
}
