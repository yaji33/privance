"use client";

import { useMemo, useState } from "react";
import { BorrowerPanel } from "../_components/dashboard/BorrowerPanel";
import { LenderPanel } from "../_components/dashboard/LenderPanel";
import { RepaymentPanel } from "../_components/dashboard/RepaymentPanel";
import { useFhevm } from "@fhevm-sdk";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useCollateral } from "~~/hooks/privance/useCollateral";
import { useMarketplace } from "~~/hooks/privance/useMarketplace";
import { useRepaymentTracker } from "~~/hooks/privance/useRepaymentTracker";
import { useAccount } from "wagmi";

const MOCK_CHAINS = { 31337: "http://localhost:8545" } as const;

type Tab = "borrower" | "lender" | "agreements";

export default function DashboardPage() {
  const { isConnected, chain } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("borrower");

  const provider = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return (window as any).ethereum;
  }, []);

  const { instance, status: fhevmStatus, error: fhevmError } = useFhevm({
    provider,
    chainId: chain?.id,
    initialMockChains: MOCK_CHAINS,
    enabled: isConnected,
  });

  const marketplace = useMarketplace({ instance, fhevmStatus, fhevmError });
  const collateral = useCollateral();
  const repayment = useRepaymentTracker();

  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[#E8EDF8] shadow-sm p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-2xl bg-[#EBF0FF] grid place-items-center mx-auto mb-5">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <rect x="5" y="14" width="20" height="15" rx="3" stroke="#1741D9" strokeWidth="1.8" />
              <path d="M9 14V10.5C9 7.46 11.69 5 15 5s6 2.46 6 5.5V14" stroke="#1741D9" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Connect your wallet</h2>
          <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
            Connect to Sepolia to access Privance — encrypted lending powered by Zama FHEVM.
          </p>
          <div className="flex justify-center">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className={`mb-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm border transition-opacity duration-300 ${
          !fhevmStatus || fhevmStatus === "ready"
            ? "opacity-0 pointer-events-none select-none border-transparent bg-transparent"
            : fhevmStatus === "error"
              ? "opacity-100 bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]"
              : "opacity-100 bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
        }`}>
          <span>{fhevmStatus === "error" ? "⚠" : "⏳"}</span>
          <span className="font-medium">
            {fhevmStatus === "error"
              ? `FHE initialization failed${fhevmError ? `: ${String(fhevmError)}` : ". Try refreshing the page."}`
              : "Initializing FHE encryption layer — this takes a few seconds on first load…"}
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Sepolia Testnet
            {marketplace.marketplaceAddress && (
              <a
                href={`https://sepolia.etherscan.io/address/${marketplace.marketplaceAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-[#1741D9] hover:underline font-mono text-xs"
              >
                {marketplace.marketplaceAddress.slice(0, 6)}…{marketplace.marketplaceAddress.slice(-4)}
              </a>
            )}
          </p>
        </div>

        <div className="flex gap-1 bg-white border border-[#E8EDF8] rounded-2xl p-1.5 w-fit mb-8 shadow-sm">
          {([
            { id: "borrower",   label: "Borrower",   icon: "↓" },
            { id: "lender",     label: "Lender",     icon: "↑" },
            { id: "agreements", label: "Agreements", icon: "⇄" },
          ] as { id: Tab; label: string; icon: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-[#1741D9] text-white shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
              }`}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              {tab.label}
              {tab.id === "agreements" && repayment.agreements.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === "agreements" ? "bg-white/20 text-white" : "bg-[#EBF0FF] text-[#1741D9]"
                }`}>
                  {repayment.agreements.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "borrower" ? (
          <BorrowerPanel marketplace={marketplace} collateral={collateral} />
        ) : activeTab === "lender" ? (
          <LenderPanel marketplace={marketplace} />
        ) : (
          <RepaymentPanel repayment={repayment} />
        )}
      </div>
    </div>
  );
}
