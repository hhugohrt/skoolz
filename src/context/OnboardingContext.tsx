import { createContext, useContext, useState, type ReactNode } from "react";
import type { Level } from "@/lib/api";

interface OnboardingContextValue {
  level: Level | null;
  setLevel: (level: Level) => void;
  subjectIds: string[];
  setSubjectIds: (ids: string[]) => void;
  toggleSubject: (id: string) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<Level | null>(null);
  const [subjectIds, setSubjectIds] = useState<string[]>([]);

  function toggleSubject(id: string) {
    setSubjectIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  return (
    <OnboardingContext.Provider
      value={{ level, setLevel, subjectIds, setSubjectIds, toggleSubject }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
