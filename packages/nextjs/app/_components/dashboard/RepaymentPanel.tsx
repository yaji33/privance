"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { useRepaymentTracker, type Agreement } from "~~/hooks/privance/useRepaymentTracker";

const fmtEth = (wei: bigint | undefined) =>
  wei !== undefined ? `${parseFloat(ethers.formatEther(wei)).toFixed(4)} ETH` : "—";

const fmtDate = (ts: bigint) =>
  ts > 0n
    ? new Date(Number(ts) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

const fmtProgress = (repaid: bigint, total: bigint) =>
  total > 0n ? Math.min(100, Math.round((Number(repaid) * 100) / Number(total))) : 0;

type Props = { repayment: ReturnType<typeof useRepaymentTracker> };

function AgreementStatusBadge({ ag }: { ag: Agreement }) {
  if (ag.isDefaulted)
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#DC2626]">Defaulted</span>;
  if (ag.isRepaid)
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#16A34A]">Repaid</span>;
  if (ag.isActive)
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EBF0FF] text-[#1741D9]">Active</span>;
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#64748B]">Inactive</span>;
}

function AgreementRow({
  ag,
  role,
  isProcessing,
  onPay,
  onDefault,
}: {
  ag: Agreement;
  role: "borrower" | "lender";
  isProcessing: boolean;
  onPay: (id: bigint, amount: string) => void;
  onDefault: (id: bigint) => void;
}) {
  const [payAmount, setPayAmount] = useState("");
  const progress = fmtProgress(ag.amountRepaid, ag.totalRepaymentAmount);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="font-mono text-xs text-[#94A3B8]">Agreement #{String(ag.agreementId)}</span>
          <div className="flex items-center gap-2 mt-1">
            <AgreementStatusBadge ag={ag} />
            <span className="text-xs text-[#64748B]">
              {role === "borrower" ? "You borrowed" : "You lent"}
            </span>
          </div>
        </div>
        <span className="text-lg font-bold text-[#0F172A]">{fmtEth(ag.principal)}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Total Due", value: fmtEth(ag.totalRepaymentAmount) },
          { label: "Repaid",    value: fmtEth(ag.amountRepaid) },
          { label: "Due Date",  value: fmtDate(ag.dueDate) },
          { label: "Interest",  value: `${(Number(ag.interestRate) / 100).toFixed(2)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#F8FAFC] rounded-xl px-3 py-2.5">
            <p className="text-xs text-[#94A3B8] mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-[#0F172A]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-[#94A3B8] mb-1">
          <span>Repayment progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              ag.isRepaid ? "bg-[#16A34A]" : ag.isDefaulted ? "bg-[#DC2626]" : "bg-[#1741D9]"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {ag.isActive && !ag.isRepaid && !ag.isDefaulted && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#F1F5F9]">
          {role === "borrower" && (
            <div className="flex gap-2 flex-1 min-w-0">
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                placeholder="ETH amount"
                className="flex-1 min-w-0 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1741D9]/20 focus:border-[#1741D9]"
              />
              <button
                onClick={() => { if (payAmount) { onPay(ag.agreementId, payAmount); setPayAmount(""); } }}
                disabled={isProcessing || !payAmount}
                className="px-4 py-2 bg-[#1741D9] text-white text-sm font-semibold rounded-lg hover:bg-[#1236BA] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all whitespace-nowrap"
              >
                {isProcessing ? "Paying…" : "Make Payment"}
              </button>
            </div>
          )}
          <button
            onClick={() => onDefault(ag.agreementId)}
            disabled={isProcessing}
            className="px-4 py-2 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm font-semibold rounded-lg hover:bg-[#FEE2E2] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            Check Default
          </button>
        </div>
      )}
    </div>
  );
}

type ViewTab = "borrower" | "lender";

export const RepaymentPanel = ({ repayment }: Props) => {
  const { address } = useAccount();
  const { agreements, borrowerIds, lenderIds, makePayment, checkDefault, isProcessing } = repayment;

  const [viewTab, setViewTab] = useState<ViewTab>("borrower");

  const borrowerAgreements = useMemo(
    () => agreements.filter(a => a.borrower?.toLowerCase() === address?.toLowerCase()),
    [agreements, address],
  );

  const lenderAgreements = useMemo(
    () => agreements.filter(a => a.lender?.toLowerCase() === address?.toLowerCase()),
    [agreements, address],
  );

  const displayed = viewTab === "borrower" ? borrowerAgreements : lenderAgreements;
  const borrowerCount = borrowerIds?.length ?? 0;
  const lenderCount = lenderIds?.length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-white border border-[#E2E8F0] rounded-xl p-1 w-fit">
        {(["borrower", "lender"] as ViewTab[]).map(t => (
          <button
            key={t}
            onClick={() => setViewTab(t)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              viewTab === t
                ? "bg-[#1741D9] text-white"
                : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
            }`}
          >
            {t === "borrower" ? `Borrowed (${borrowerCount})` : `Lent (${lenderCount})`}
          </button>
        ))}
      </div>

      {displayed.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Agreements", value: displayed.length },
            { label: "Active",  value: displayed.filter(a => a.isActive && !a.isRepaid && !a.isDefaulted).length },
            { label: "Repaid",  value: displayed.filter(a => a.isRepaid).length },
            { label: "Defaulted", value: displayed.filter(a => a.isDefaulted).length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3">
              <p className="text-xs text-[#94A3B8]">{label}</p>
              <p className="text-xl font-bold text-[#0F172A] mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}

      {displayed.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center">
          <p className="text-sm text-[#94A3B8]">
            {viewTab === "borrower"
              ? "No agreements as borrower yet. Get a loan funded to see it here."
              : "No agreements as lender yet. Fund a matched loan to see it here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(ag => (
            <AgreementRow
              key={String(ag.agreementId)}
              ag={ag}
              role={viewTab}
              isProcessing={isProcessing}
              onPay={makePayment}
              onDefault={checkDefault}
            />
          ))}
        </div>
      )}
    </div>
  );
};
