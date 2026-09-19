import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Point d'entrée de l'onboarding : l'adresse e-mail doit d'abord être confirmée (les comptes Google le sont déjà).
export function OnboardingIndex() {
  const { user } = useAuth();
  return <Navigate to={user && !user.emailVerified ? "verify" : "level"} replace />;
}
