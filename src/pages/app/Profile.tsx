import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type ApiSubject } from "@/lib/api";

const LEVEL_LABELS: Record<string, string> = {
  "3e": "3e",
  seconde: "Seconde",
  premiere: "Première",
  terminale: "Terminale",
  superieur: "Études supérieures",
};

export default function Profile() {
  const { user, token } = useAuth();
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [sheetCount, setSheetCount] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);

  useEffect(() => {
    api.listCourses(token!).then(({ courses }) => setCourseCount(courses.length));
    api.listSheets(token!).then(({ sheets }) => setSheetCount(sheets.length));
    Promise.all([api.listSubjects(token!), api.getMySubjectIds(token!)]).then(
      ([{ subjects }, { subjectIds }]) => {
        setSubjects(subjects.filter((s) => subjectIds.includes(s.id)));
      },
    );
  }, [token]);

  if (!user) return null;

  const initials = user.firstName.slice(0, 2).toUpperCase();

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold text-text sm:text-[30px]">Profil</h1>

      <div className="mt-6 flex items-center gap-4 rounded-[20px] border border-border/60 bg-white p-6">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-purple text-[20px] font-bold text-white">
          {initials}
        </span>
        <div>
          <p className="text-[18px] font-semibold text-text">{user.firstName}</p>
          <p className="text-[14px] text-text-secondary">{user.email}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-[14px] border border-border/60 bg-white p-5">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Niveau</p>
          <p className="mt-1 text-[16px] font-semibold text-text">
            {user.level ? LEVEL_LABELS[user.level] : "Non renseigné"}
          </p>
        </div>
        <div className="rounded-[14px] border border-border/60 bg-white p-5">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">Matières</p>
          <p className="mt-1 text-[15px] text-text">
            {subjects.length > 0 ? subjects.map((s) => s.name).join(", ") : "Aucune matière sélectionnée"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-[14px] border border-border/60 bg-white p-5 text-center">
          <p className="font-display text-[28px] font-bold text-text">{courseCount ?? "—"}</p>
          <p className="text-[13px] text-text-secondary">Cours importés</p>
        </div>
        <div className="rounded-[14px] border border-border/60 bg-white p-5 text-center">
          <p className="font-display text-[28px] font-bold text-text">{sheetCount ?? "—"}</p>
          <p className="text-[13px] text-text-secondary">Fiches créées</p>
        </div>
      </div>
    </div>
  );
}
