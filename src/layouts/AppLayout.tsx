import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";
import { usePageMeta } from "@/lib/usePageMeta";

export function AppLayout() {
  usePageMeta({ title: "Mon espace — Skoolz", path: "/app" });
  return (
    <div className="relative min-h-screen bg-bg">
      <BackgroundBlobs />
      <Sidebar />
      <MobileNav />
      <main className="relative mx-auto max-w-[1100px] px-5 py-8 pb-28 sm:px-8 lg:pl-[112px] lg:pr-8 lg:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
