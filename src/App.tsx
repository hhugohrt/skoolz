import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OnboardingLayout } from "@/layouts/OnboardingLayout";
import { AppLayout } from "@/layouts/AppLayout";
import Landing from "@/pages/Landing";
import Terms from "@/pages/legal/Terms";
import Privacy from "@/pages/legal/Privacy";
import LegalNotice from "@/pages/legal/LegalNotice";
import SignUp from "@/pages/SignUp";
import SignIn from "@/pages/SignIn";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import Dashboard from "@/pages/Dashboard";
import OnboardingLevel from "@/pages/onboarding/Level";
import OnboardingSubjects from "@/pages/onboarding/Subjects";
import OnboardingInstall from "@/pages/onboarding/Install";
import OnboardingComplete from "@/pages/onboarding/Complete";
import Courses from "@/pages/app/Courses";
import PayParent from "@/pages/PayParent";
import SubjectCourses from "@/pages/app/SubjectCourses";
import SheetDetail from "@/pages/app/SheetDetail";
import SheetQuiz from "@/pages/app/SheetQuiz";
import SheetFlashcards from "@/pages/app/SheetFlashcards";
import Revise from "@/pages/app/Revise";
import Profile from "@/pages/app/Profile";
import Settings from "@/pages/app/Settings";
import MobileUpload from "@/pages/MobileUpload";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/cgu" element={<Terms />} />
        <Route path="/confidentialite" element={<Privacy />} />
        <Route path="/mentions-legales" element={<LegalNotice />} />
        <Route path="/pay/:token" element={<PayParent />} />
        <Route path="/m/:sessionId" element={<MobileUpload />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingProvider>
                <OnboardingLayout />
              </OnboardingProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="level" replace />} />
          <Route path="level" element={<OnboardingLevel />} />
          <Route path="subjects" element={<OnboardingSubjects />} />
          <Route path="install" element={<OnboardingInstall />} />
          <Route path="complete" element={<OnboardingComplete />} />
        </Route>

        <Route
          path="/app"
          element={
            <ProtectedRoute requireOnboarding>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:subjectId" element={<SubjectCourses />} />
          <Route path="sheets" element={<Navigate to="/app/courses" replace />} />
          <Route path="sheets/:id" element={<SheetDetail />} />
          <Route path="sheets/:id/quiz" element={<SheetQuiz />} />
          <Route path="sheets/:id/flashcards" element={<SheetFlashcards />} />
          <Route path="revise" element={<Revise />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </AuthProvider>
  );
}
