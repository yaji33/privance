"use client";

import { Suspense } from "react";
import { Header } from "~~/components/Header";
import { useRepaymentTracker } from "~~/hooks/privance/useRepaymentTracker";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const repayment = useRepaymentTracker();

  return (
    <>
      <Suspense fallback={null}>
        <Header agreementCount={repayment.agreements.length} />
      </Suspense>
      {children}
    </>
  );
}
