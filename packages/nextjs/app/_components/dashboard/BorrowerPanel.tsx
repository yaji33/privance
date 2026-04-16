"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { CollateralCard } from "./CollateralCard";
import { CreditScoreCard } from "./CreditScoreCard";
import { useCollateral } from "~~/hooks/privance/useCollateral";
import { useMarketplace } from "~~/hooks/privance/useMarketplace";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~~/components/ui/select";

const fmtEth = (wei: bigint | undefined) =>
  wei !== undefined ? `${parseFloat(ethers.formatEther(wei)).toFixed(4)} ETH` : "—";
const fmtDays = (secs: bigint) => `${Math.round(Number(secs) / 86400)}d`;
const fmtDate = (ts: bigint) =>
  new Date(Number(ts) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });

type Props = {
  marketplace: ReturnType<typeof useMarketplace>;
  collateral: ReturnType<typeof useCollateral>;
};

const DURATION_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
  { label: "90 days", value: 90 },
];

export const BorrowerPanel = ({ marketplace, collateral }: Props) => {
  const { address } = useAccount();
  const {
    hasCreditScore,
    nextLoanId,
    loanList,
    createLoanRequest,
    cancelLoanRequest,
    isProcessing,
    isInstanceReady,
    isFhevmError,
  } = marketplace;

  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState(30);

  const myLoans = useMemo(
    () => loanList.filter(l => l.borrower?.toLowerCase() === address?.toLowerCase()),
    [loanList, address],
  );

  const handleCreate = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    await createLoanRequest(amount, duration);
    setAmount("");
  };

  const statusBadge = (loan: (typeof myLoans)[number]) => {
    if (loan.isFunded)
      return (
        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]">
          Funded
        </span>
      );
    if (!loan.isActive)
      return (
        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-100">
          Cancelled
        </span>
      );
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F0F7FF] text-[#1d67dd] border border-[#E0E7FF]">
        Active
      </span>
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CreditScoreCard marketplace={marketplace} />
        <CollateralCard collateral={collateral} />
      </div>

      <div className="rounded-2xl border border-[#E8EDF8] bg-white shadow-[0_4px_20px_-8px_rgba(29,103,221,0.08)] overflow-hidden">
        <div className="px-6 pt-5 pb-4 flex items-start justify-between border-b border-slate-50">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1d67dd] mb-1">
              My Loan Requests
            </p>
            <h3 className="font-bold text-[#0F172A] text-[15px]">All requests from this wallet</h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full shrink-0 mt-0.5">
            {myLoans.length} total
          </span>
        </div>

        <div className="px-6 py-4">
          {myLoans.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-slate-400">No loan requests yet. Submit one below.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["ID", "Amount", "Duration", "Posted", "Status", ""].map(h => (
                      <th
                        key={h}
                        className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 px-1"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {myLoans.map(loan => (
                    <tr
                      key={String(loan.id)}
                      className="hover:bg-[#F8FAFF] transition-colors"
                    >
                      <td className="py-3 px-1 font-mono text-[11px] text-slate-400">
                        #{String(loan.id)}
                      </td>
                      <td className="py-3 px-1 font-semibold text-[13px] text-[#0F172A]">
                        {fmtEth(loan.plainRequestedAmount)}
                      </td>
                      <td className="py-3 px-1 text-[13px] text-slate-500">
                        {fmtDays(loan.plainDuration)}
                      </td>
                      <td className="py-3 px-1 text-[13px] text-slate-400">
                        {loan.timestamp > 0n ? fmtDate(loan.timestamp) : "—"}
                      </td>
                      <td className="py-3 px-1">{statusBadge(loan)}</td>
                      <td className="py-3 px-1 text-right">
                        {loan.isActive && !loan.isFunded && (
                          <button
                            onClick={() => cancelLoanRequest(loan.id)}
                            disabled={isProcessing}
                            className="text-[11px] font-semibold text-slate-400 hover:text-red-500 active:scale-95 disabled:opacity-40 transition-all"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8EDF8] bg-white shadow-[0_4px_20px_-8px_rgba(29,103,221,0.08)] p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1d67dd] mb-1">
              New Request
            </p>
            <h3 className="font-bold text-[#0F172A] text-[15px]">New Loan Request</h3>
            <p className="text-[12px] text-slate-400 mt-0.5">
              Loan amount is encrypted with FHE before submission
            </p>
          </div>
          {nextLoanId !== undefined && (
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full shrink-0 mt-0.5">
              Next ID: #{String(nextLoanId)}
            </span>
          )}
        </div>

        {!hasCreditScore && (
          <div className="mb-5 p-4 rounded-xl border border-[#1d67dd]/10 bg-[#F8FAFF]">
            <p className="text-[12px] font-medium text-[#1d67dd] leading-relaxed">
              A valid credit score is required to create a loan request. Compute your score above first.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Loan Amount (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              placeholder="e.g. 0.05"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-[#0F172A] placeholder-slate-300 bg-white focus:outline-none focus:border-[#1d67dd] transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Duration
            </label>
            <Select value={String(duration)} onValueChange={(v: string | null) => v && setDuration(Number(v))}>
              <SelectTrigger className="w-full h-[41px] border-slate-200 rounded-xl px-3.5 text-[13px] text-[#0F172A] bg-white focus:border-[#1d67dd] transition-all">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={String(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5 px-1">
          <div className="w-1 h-1 bg-[#1d67dd] rounded-full" />
          <p className="text-[11px] text-slate-400 font-medium">
            Amount encrypted via FHE before broadcast — lenders only see a ciphertext
          </p>
        </div>

        <button
          onClick={handleCreate}
          disabled={isProcessing || !hasCreditScore || !amount || !isInstanceReady}
          title={
            isFhevmError ? "FHE initialization failed — try refreshing the page" : undefined
          }
          className="w-full py-3 bg-[#1d67dd] text-white text-[13px] font-bold rounded-full hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          {isFhevmError
            ? "FHE Unavailable"
            : !isInstanceReady
              ? "Initializing FHE…"
              : isProcessing
                ? "Encrypting & Submitting…"
                : "Submit Loan Request"}
        </button>
      </div>
    </div>
  );
};  