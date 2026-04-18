import { Suspense } from "react";
import { DashboardPageContent } from "./DashboardPageContent";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-64px)] bg-white flex items-center justify-center px-4">
          <span className="text-sm text-[#64748B]">Loading dashboard…</span>
        </div>
      }
    >
      <DashboardPageContent />
    </Suspense>
  );
}
