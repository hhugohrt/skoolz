import { Outlet, useLocation } from "react-router-dom";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";
import { Logo } from "@/components/Logo";

const STEPS = ["level", "subjects", "theme", "complete"];

export function OnboardingLayout() {
  const location = useLocation();
  const currentStep = STEPS.findIndex((step) => location.pathname.endsWith(step));

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <BackgroundBlobs />
      <div className="relative mx-auto flex min-h-screen max-w-[720px] flex-col items-center px-5 py-8 sm:px-8">
        <div className="flex w-full items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <span
                key={step}
                className={`h-1.5 rounded-full transition-all ${
                  index <= currentStep ? "w-6 bg-purple" : "w-3 bg-purple/20"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex w-full flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[560px] rounded-[20px] border border-border/60 bg-white p-8 shadow-[0_18px_60px_rgba(54,44,120,0.1)] sm:p-12">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
