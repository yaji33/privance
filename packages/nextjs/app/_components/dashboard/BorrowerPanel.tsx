"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { CollateralCard } from "./CollateralCard";
import { CreditScoreCard } from "./CreditScoreCard";
import { useCollateral } from "~~/hooks/privance/useCollateral";
import { useMarketplace } from "~~/hooks/privance/useMarketplace";

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
  const { hasCreditScore, nextLoanId, loanList, createLoanRequest, cancelLoanRequest, isProcessing, isInstanceReady, isFhevmError } = marketplace;

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
    if (loan.isFunded) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#16A34A]">Funded</span>;
    if (!loan.isActive) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#64748B]">Cancelled</span>;
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EBF0FF] text-[#1741D9]">Active</span>;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreditScoreCard marketplace={marketplace} />
        <CollateralCard collateral={collateral} />
      </div>
      
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-[#0F172A] text-base">My Loan Requests</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">All loan requests submitted from this wallet</p>
          </div>
          <span className="text-xs text-[#94A3B8] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-full shrink-0">
            {myLoans.length} total
          </span>
        </div>
        {myLoans.length === 0 ? (
          <p className="text-sm text-[#94A3B8] py-4 text-center">No loan requests yet. Submit one below.</p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-[#F1F5F9]">
                  {["ID", "Amount", "Duration", "Posted", "Status", ""].map(h => (
                    <th key={h} className="pb-2.5 text-left text-xs font-semibold text-[#94A3B8] px-1">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myLoans.map(loan => (
                  <tr key={String(loan.id)} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-1 font-mono text-xs text-[#64748B]">#{String(loan.id)}</td>
                    <td className="py-3 px-1 font-medium text-[#0F172A]">{fmtEth(loan.plainRequestedAmount)}</td>
                    <td className="py-3 px-1 text-[#64748B]">{fmtDays(loan.plainDuration)}</td>
                    <td className="py-3 px-1 text-[#64748B]">{loan.timestamp > 0n ? fmtDate(loan.timestamp) : "—"}</td>
                    <td className="py-3 px-1">{statusBadge(loan)}</td>
                    <td className="py-3 px-1">
                      {loan.isActive && !loan.isFunded && (
                        <button
                          onClick={() => cancelLoanRequest(loan.id)}
                          disabled={isProcessing}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-40"
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

      <div className="bg-white rounded-2xl border border-[#E8EDF8] shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-bold text-[#0F172A] text-lg">New Loan Request</h3>
            <p className="text-sm text-[#94A3B8] mt-0.5">
              Loan amount is encrypted with FHE before submission
            </p>
          </div>
          {nextLoanId !== undefined && (
            <span className="text-xs text-[#94A3B8] bg-[#F8FAFF] border border-[#E8EDF8] px-2.5 py-1 rounded-full">
              Next ID: #{String(nextLoanId)}
            </span>
          )}
        </div>

        {!hasCreditScore && (
          <div className="mb-5 flex gap-3 items-start p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L1 14h14L8 1z" stroke="#D97706" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M8 6v4M8 11.5v.5" stroke="#D97706" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <p className="text-sm text-amber-800">
              A valid credit score is required to create a loan request. Compute your score above first.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">Loan Amount (ETH)</label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              placeholder="e.g. 0.05"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1741D9]/20 focus:border-[#1741D9]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">Duration</label>
            <select
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#1741D9]/20 focus:border-[#1741D9]"
            >
              {DURATION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-4 px-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="2" y="5" width="8" height="6" rx="1" stroke="#94A3B8" strokeWidth="1.2" />
            <path d="M4 5V4a2 2 0 0 1 4 0v1" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Amount encrypted via FHE before broadcast — lenders only see a ciphertext
        </div>

        <button
          onClick={handleCreate}
          disabled={isProcessing || !hasCreditScore || !amount || !isInstanceReady}
          title={isFhevmError ? "FHE initialization failed — try refreshing the page" : undefined}
          className="w-full py-3 bg-[#1741D9] text-white text-sm font-semibold rounded-xl hover:bg-[#1236BA] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          {isFhevmError ? "FHE Unavailable" : !isInstanceReady ? "Initializing FHE..." : isProcessing ? "Encrypting & Submitting..." : "Submit Loan Request"}
        </button>
      </div>

    </div>
  );
};
