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
    <div className="rounded-2xl border border-[#E8EDF8] bg-white shadow-[0_4px_20px_-8px_rgba(29,103,221,0.08)] p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1d67dd] mb-1">Vault</p>
          <h3 className="font-bold text-[#0F172A] text-[15px]">Collateral Vault</h3>
          <p className="text-[12px] text-slate-400 mt-0.5">Non-custodial · Auto-liquidating</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-1.5">Available</p>
          <p className="text-[18px] font-bold text-[#0F172A] leading-none">{fmt(availableCollateral)}</p>
        </div>
        <div className="rounded-xl border border-[#1d67dd]/10 bg-[#F8FAFF] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1d67dd]/60 mb-1.5">Locked</p>
          <p className="text-[18px] font-bold text-[#1d67dd] leading-none">{fmt(lockedCollateral)}</p>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100/70 rounded-xl p-1 mb-4">
        {(["deposit", "withdraw"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[12px] font-bold rounded-lg capitalize transition-all ${
              activeTab === tab ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-400 hover:text-slate-600"
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
            className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-[#0F172A] placeholder-slate-300 bg-white focus:outline-none focus:border-[#1d67dd] transition-all"
          />
          <button
            onClick={handleDeposit}
            disabled={isProcessing || !depositAmt}
            className="px-5 py-2.5 bg-[#1d67dd] text-white text-[12px] font-bold rounded-full hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            {isProcessing ? "…" : "Deposit"}
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
            className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-[#0F172A] placeholder-slate-300 bg-white focus:outline-none focus:border-[#1d67dd] transition-all"
          />
          <button
            onClick={handleWithdraw}
            disabled={isProcessing || !withdrawAmt}
            className="px-5 py-2.5 bg-white border border-slate-200 text-[#1d67dd] text-[12px] font-bold rounded-xl hover:bg-[#F8FAFF] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            {isProcessing ? "…" : "Withdraw"}
          </button>
        </div>
      )}
    </div>
  );
};
