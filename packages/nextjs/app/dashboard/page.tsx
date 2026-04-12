"use client";

import { useMemo, useState } from "react";
import { BorrowerPanel } from "../_components/dashboard/BorrowerPanel";
import { LenderPanel } from "../_components/dashboard/LenderPanel";
import { useFhevm } from "@fhevm-sdk";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useCollateral } from "~~/hooks/privance/useCollateral";
import { useMarketplace } from "~~/hooks/privance/useMarketplace";
import { useAccount } from "wagmi";

const MOCK_CHAINS = { 31337: "http://localhost:8545" } as const;

type Tab = "borrower" | "lender";

export default function DashboardPage() {
  const { isConnected, chain } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("borrower");

  const provider = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return (window as any).ethereum;
  }, []);

  const { instance } = useFhevm({
    provider,
    chainId: chain?.id,
    initialMockChains: MOCK_CHAINS,
    enabled: isConnected,
  });

  const marketplace = useMarketplace({ instance });
  const collateral = useCollateral();

  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] flex items-center justify-center px-4">
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
          <RainbowKitCustomConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
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
            { id: "borrower", label: "Borrower", icon: "↓" },
            { id: "lender", label: "Lender", icon: "↑" },
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
            </button>
          ))}
        </div>

        {activeTab === "borrower" ? (
          <BorrowerPanel marketplace={marketplace} collateral={collateral} />
        ) : (
          <LenderPanel marketplace={marketplace} />
        )}
      </div>
    </div>
  );
}
