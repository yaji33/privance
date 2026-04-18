"use client";

import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { AnimatePresence, motion } from "framer-motion";
import { useAccount } from "wagmi";
import { type Agreement, useRepaymentTracker } from "~~/hooks/privance/useRepaymentTracker";

const fmtEth = (wei: bigint | undefined) =>
  wei !== undefined ? `${parseFloat(ethers.formatEther(wei)).toFixed(4)} ETH` : "—";

const fmtDate = (ts: bigint) =>
  ts > 0n
    ? new Date(Number(ts) * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const fmtProgress = (repaid: bigint, total: bigint) =>
  total > 0n ? Math.min(100, Math.round((Number(repaid) * 100) / Number(total))) : 0;

type Props = { repayment: ReturnType<typeof useRepaymentTracker> };
type ViewTab = "borrower" | "lender";

const SpinnerIcon = () => (
  <svg
    className="animate-spin"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const EmptyIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-slate-300"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

const AgreementStatusBadge = ({ ag }: { ag: Agreement }) => {
  if (ag.isDefaulted)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-500 border border-red-100">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Defaulted
      </span>
    );
  if (ag.isRepaid)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Repaid
      </span>
    );
  if (ag.isActive)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EBF0FF] text-[#1741D9] border border-[#1741D9]/15">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1741D9] animate-pulse" />
        Active
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-100">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
      Inactive
    </span>
  );
};

function AgreementCard({
  ag,
  role,
  isProcessing,
  onPay,
  onDefault,
  index,
}: {
  ag: Agreement;
  role: "borrower" | "lender";
  isProcessing: boolean;
  onPay: (id: bigint, amount: string) => void;
  onDefault: (id: bigint) => void;
  index: number;
}) {
  const [payAmount, setPayAmount] = useState("");
  const progress = fmtProgress(ag.amountRepaid, ag.totalRepaymentAmount);

  const progressColor = ag.isRepaid ? "bg-emerald-400" : ag.isDefaulted ? "bg-red-400" : "bg-[#1741D9]";

  const canAct = ag.isActive && !ag.isRepaid && !ag.isDefaulted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-[1.25rem] border border-[#E8EDF8] shadow-[0_4px_24px_-8px_rgba(29,103,221,0.09)] overflow-hidden"
    >
      <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4 border-b border-[#F1F5F9]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
              Agreement #{String(ag.agreementId)}
            </span>
            <AgreementStatusBadge ag={ag} />
          </div>
          <p className="text-[12px] text-slate-400">{role === "borrower" ? "You borrowed" : "You lent"}</p>
        </div>
        <span className="text-[22px] font-bold text-[#0F172A] leading-none tabular-nums shrink-0">
          {fmtEth(ag.principal)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#F1F5F9]">
        {[
          { label: "Total Due", value: fmtEth(ag.totalRepaymentAmount) },
          { label: "Repaid", value: fmtEth(ag.amountRepaid) },
          { label: "Due Date", value: fmtDate(ag.dueDate) },
          { label: "Interest", value: `${(Number(ag.interestRate) / 100).toFixed(2)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#F8FAFC] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8] mb-1">{label}</p>
            <p className="text-[13px] font-bold text-[#0F172A] tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-b border-[#F1F5F9]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">Repayment Progress</p>
          <p className="text-[11px] font-bold text-[#0F172A]">{progress}%</p>
        </div>
        <div className="h-[6px] bg-[#F1F5F9] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: index * 0.06 + 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full rounded-full ${progressColor}`}
          />
        </div>
      </div>

      {canAct && (
        <div className="px-6 py-4 flex flex-wrap gap-2.5 items-center">
          {role === "borrower" && (
            <div className="flex gap-2 flex-1 min-w-0">
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                placeholder="ETH amount"
                className="flex-1 min-w-0 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-[13px] text-[#0F172A] placeholder-[#CBD5E1]
                           focus:outline-none focus:ring-2 focus:ring-[#1741D9]/20 focus:border-[#1741D9] transition-all"
              />
              <button
                onClick={() => {
                  if (payAmount) {
                    onPay(ag.agreementId, payAmount);
                    setPayAmount("");
                  }
                }}
                disabled={isProcessing || !payAmount}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1741D9] text-white text-[13px] font-bold rounded-full
                           hover:bg-[#1236BA] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-all whitespace-nowrap
                           shadow-[0_4px_14px_-4px_rgba(23,65,217,0.45)]"
              >
                {isProcessing ? <SpinnerIcon /> : null}
                {isProcessing ? "Paying…" : "Make Payment"}
              </button>
            </div>
          )}
          <button
            onClick={() => onDefault(ag.agreementId)}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-50 border border-red-100 text-red-500 text-[13px] font-bold rounded-full
                       hover:bg-red-100 hover:border-red-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-all"
          >
            Check Default
          </button>
        </div>
      )}
    </motion.div>
  );
}

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

  const stats = useMemo(
    () => [
      { label: "Total", value: displayed.length },
      { label: "Active", value: displayed.filter(a => a.isActive && !a.isRepaid && !a.isDefaulted).length },
      { label: "Repaid", value: displayed.filter(a => a.isRepaid).length },
      { label: "Defaulted", value: displayed.filter(a => a.isDefaulted).length },
    ],
    [displayed],
  );

  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-slate-100/70 rounded-xl p-1 w-fit">
        {(["borrower", "lender"] as ViewTab[]).map(t => (
          <button
            key={t}
            onClick={() => setViewTab(t)}
            className={`px-5 py-2 text-[13px] font-bold rounded-lg transition-all duration-200 ${
              viewTab === t ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t === "borrower" ? `Borrowed (${borrowerCount})` : `Lent (${lenderCount})`}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {displayed.length > 0 && (
          <motion.div
            key={viewTab + "-stats"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {stats.map(({ label, value }) => (
              <div
                key={label}
                className="bg-white border border-[#E8EDF8] rounded-[1.25rem] px-5 py-4 shadow-[0_2px_12px_-4px_rgba(29,103,221,0.07)]"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#94A3B8] mb-1.5">{label}</p>
                <p className="text-[26px] font-bold text-[#0F172A] leading-none tabular-nums">{value}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {displayed.length === 0 ? (
          <motion.div
            key={viewTab + "-empty"}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-[#E8EDF8] rounded-[1.25rem] py-16 px-8 text-center shadow-[0_2px_12px_-4px_rgba(29,103,221,0.07)]"
          >
            <div className="flex justify-center mb-4">
              <EmptyIcon />
            </div>
            <p className="text-[13px] font-semibold text-slate-400 max-w-xs mx-auto leading-relaxed">
              {viewTab === "borrower"
                ? "No agreements as borrower yet. Get a loan funded to see it here."
                : "No agreements as lender yet. Fund a matched loan to see it here."}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={viewTab + "-list"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {displayed.map((ag, i) => (
              <AgreementCard
                key={String(ag.agreementId)}
                ag={ag}
                role={viewTab}
                isProcessing={isProcessing}
                onPay={makePayment}
                onDefault={checkDefault}
                index={i}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
