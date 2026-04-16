"use client";

import { Header } from "~~/components/Header";
import { useRepaymentTracker } from "~~/hooks/privance/useRepaymentTracker";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const repayment = useRepaymentTracker();

  return (
    <>
      <Header agreementCount={repayment.agreements.length} />
      {children}
    </>
  );
}