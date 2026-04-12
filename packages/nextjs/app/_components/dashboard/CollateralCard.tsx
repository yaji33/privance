"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useCollateral } from "~~/hooks/privance/useCollateral";

type Props = {
  collateral: ReturnType<typeof useCollateral>;
};

const fmt = (wei: bigint | undefined): string =>
  wei !== undefined ? `${parseFloat(ethers.formatEther(wei)).toFixed(4)} ETH` : "—";

export const CollateralCard = ({ collateral }: Props) => {
  const { availableCollateral, totalCollateral, depositCollateral, withdrawCollateral, isProcessing } = collateral;

  const [depositAmt, setDepositAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

  const handleDeposit = async () => {
    if (!depositAmt || isNaN(parseFloat(depositAmt))) return;
    await depositCollateral(depositAmt);
    setDepositAmt("");
  };

  const handleWithdraw = async () => {
    if (!withdrawAmt || isNaN(parseFloat(withdrawAmt))) return;
    await withdrawCollateral(withdrawAmt);
    setWithdrawAmt("");
  };

  const lockedCollateral =
    totalCollateral !== undefined && availableCollateral !== undefined
      ? totalCollateral - availableCollateral
      : undefined;

  return (
    <div className="bg-white rounded-2xl border border-[#E8EDF8] shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-bold text-[#0F172A] text-lg">Collateral Vault</h3>
          <p className="text-sm text-[#94A3B8] mt-0.5">Non-custodial • Auto-liquidating</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#EBF0FF] grid place-items-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L3 5v4c0 3.5 2.5 6.5 6 7.5C12.5 15.5 15 12.5 15 9V5L9 2z" stroke="#1741D9" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0]">
          <p className="text-xs text-[#94A3B8] font-medium">Available</p>
          <p className="text-lg font-bold text-[#0F172A] mt-0.5">{fmt(availableCollateral)}</p>
        </div>
        <div className="bg-[#FFF7ED] rounded-xl p-3.5 border border-[#FDE68A]/40">
          <p className="text-xs text-[#D97706] font-medium">Locked</p>
          <p className="text-lg font-bold text-[#92400E] mt-0.5">{fmt(lockedCollateral)}</p>
        </div>
      </div>

      <div className="flex gap-1 bg-[#F1F5F9] rounded-xl p-1 mb-4">
        {(["deposit", "withdraw"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${
              activeTab === tab
                ? "bg-white text-[#0F172A] shadow-sm"
                : "text-[#94A3B8] hover:text-[#64748B]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "deposit" ? (
        <div className="flex gap-2">
          <input
            type="number"
            step="0.001"
            min="0"
            placeholder="0.00 ETH"
            value={depositAmt}
            onChange={e => setDepositAmt(e.target.value)}
            className="flex-1 border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1741D9]/20 focus:border-[#1741D9]"
          />
          <button
            onClick={handleDeposit}
            disabled={isProcessing || !depositAmt}
            className="px-5 py-2.5 bg-[#1741D9] text-white text-sm font-semibold rounded-xl hover:bg-[#1236BA] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            {isProcessing ? "..." : "Deposit"}
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="number"
            step="0.001"
            min="0"
            placeholder="0.00 ETH"
            value={withdrawAmt}
            onChange={e => setWithdrawAmt(e.target.value)}
            className="flex-1 border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1741D9]/20 focus:border-[#1741D9]"
          />
          <button
            onClick={handleWithdraw}
            disabled={isProcessing || !withdrawAmt}
            className="px-5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1741D9] text-sm font-semibold rounded-xl hover:bg-[#EBF0FF] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            {isProcessing ? "..." : "Withdraw"}
          </button>
        </div>
      )}
    </div>
  );
};
