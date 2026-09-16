import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { useOnboarding } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { api, type ApiSubject } from "@/lib/api";

export default function OnboardingSubjects() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { subjectIds, setSubjectIds, toggleSubject } = useOnboarding();
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [customName, setCustomName] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);

  useEffect(() => {
    api
      .listSubjects(token!)
      .then(({ subjects }) => setSubjects(subjects))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAddCustom() {
    const name = customName.trim();
    if (!name) return;
    const { subject } = await api.createSubject(token!, name);
    setSubjects((prev) => (prev.some((s) => s.id === subject.id) ? prev : [...prev, subject]));
    setSubjectIds([...subjectIds, subject.id]);
    setCustomName("");
    setAddingCustom(false);
  }

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold text-text sm:text-[30px]">
        Quelles matières veux-tu travailler ?
      </h1>

      {loading ? (
        <p className="mt-6 text-[15px] text-text-secondary">Chargement…</p>
      ) : (
        <div className="mt-6 flex flex-wrap gap-2.5">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              type="button"
              onClick={() => toggleSubject(subject.id)}
              className={`rounded-full border px-4 py-2 text-[15px] font-medium transition-colors ${
                subjectIds.includes(subject.id)
                  ? "border-purple bg-purple text-white"
                  : "border-border bg-white text-text hover:border-purple/40"
              }`}
            >
              {subject.name}
            </button>
          ))}

          {addingCustom ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                placeholder="Nom de la matière"
                className="h-[38px] rounded-full border border-border bg-white px-4 text-[15px] outline-none focus:border-purple"
              />
              <button
                type="button"
                onClick={handleAddCustom}
                className="rounded-full bg-purple px-4 py-2 text-[15px] font-medium text-white"
              >
                Ajouter
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingCustom(true)}
              className="flex items-center gap-1 rounded-full border border-dashed border-border px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:border-purple/40 hover:text-text"
            >
              <Plus className="h-4 w-4" />
              Ajouter des matières
            </button>
          )}
        </div>
      )}

      <PrimaryButton
        label="Continuer"
        gradient={false}
        className="mt-8"
        disabled={subjectIds.length === 0}
        onClick={() => navigate("/onboarding/theme")}
      />
    </div>
  );
}
