import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { PricingModal } from "@/components/billing/PricingModal";

function UnlockButton({ onUnlock }: { onUnlock: () => void }) {
  return (
    <button
      type="button"
      onClick={onUnlock}
      className="flex h-[58px] items-center justify-center gap-2.5 rounded-full bg-purple px-8 text-[17px] font-semibold text-white shadow-[0_18px_50px_rgba(84,56,220,0.45)] transition-transform hover:scale-[1.03]"
    >
      <Lock className="h-5 w-5" />
      Débloquer ma fiche
    </button>
  );
}

// Compte gratuit : la fiche est floutée et le bouton « Débloquer ma fiche » se superpose au contenu.
export function LockedArea({ locked, children }: { locked: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  if (!locked) return <>{children}</>;
  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none max-h-[640px] select-none overflow-hidden blur-[9px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-start justify-center pt-24 sm:pt-32">
        <div className="sticky top-[38vh]">
          <UnlockButton onUnlock={() => setOpen(true)} />
        </div>
      </div>
      {open && <PricingModal onClose={() => setOpen(false)} />}
    </div>
  );
}

// Version pour les écrans sans aperçu (quiz, flashcards).
export function LockedNotice() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-10 flex flex-col items-center gap-4 text-center">
      <p className="text-[15px] text-text-secondary">Débloque ta fiche pour accéder à cette fonctionnalité.</p>
      <UnlockButton onUnlock={() => setOpen(true)} />
      {open && <PricingModal onClose={() => setOpen(false)} />}
    </div>
  );
}
