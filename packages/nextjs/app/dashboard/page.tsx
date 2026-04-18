"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { BorrowerPanel } from "../_components/dashboard/BorrowerPanel";
import { LenderPanel } from "../_components/dashboard/LenderPanel";
import { RepaymentPanel } from "../_components/dashboard/RepaymentPanel";
import { useFhevm } from "@fhevm-sdk";
import { useAccount, useWalletClient } from "wagmi";
import { DEFAULT_TAB, type Tab } from "~~/components/Header";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useCollateral } from "~~/hooks/privance/useCollateral";
import { useMarketplace } from "~~/hooks/privance/useMarketplace";
import { useRepaymentTracker } from "~~/hooks/privance/useRepaymentTracker";

const MOCK_CHAINS = { 31337: "http://localhost:8545" } as const;

export default function DashboardPage() {
  const { isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const searchParams = useSearchParams();

  const activeTab = (searchParams.get("tab") as Tab) ?? DEFAULT_TAB;

  const provider = useMemo(() => {
    if (!walletClient) return undefined;
    return {
      request: async (args: any) => walletClient.request(args),
      on: () => undefined,
      removeListener: () => undefined,
    };
  }, [walletClient]);

  const {
    instance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId: chain?.id,
    initialMockChains: MOCK_CHAINS,
    enabled: isConnected,
  });

  const fhevmErrorMessage = useMemo(() => {
    const raw = fhevmError ? String(fhevmError) : "";
    if (!raw) return "Try refreshing the page.";

    if (raw.includes("eip712Domain") || raw.includes("BAD_DATA")) {
      return "Wallet/provider mismatch detected. If multiple wallets are installed, use only the wallet connected in this session, then reconnect and refresh.";
    }

    if (raw.includes("does not support threads") || raw.includes("Cross-Origin-Opener-Policy")) {
      return "Browser blocked required FHE worker features. Use an extension configuration without conflicting injected providers, then refresh.";
    }

    return raw;
  }, [fhevmError]);

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
              <path
                d="M9 14V10.5C9 7.46 11.69 5 15 5s6 2.46 6 5.5V14"
                stroke="#1741D9"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
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
        <div
          className={`mb-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm border transition-opacity duration-300 ${
            !fhevmStatus || fhevmStatus === "ready"
              ? "opacity-0 pointer-events-none select-none border-transparent bg-transparent"
              : fhevmStatus === "error"
                ? "opacity-100 bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]"
                : "opacity-100 bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
          }`}
        >
          <span>{fhevmStatus === "error" ? "⚠" : "⏳"}</span>
          <span className="font-medium">
            {fhevmStatus === "error"
              ? `FHE initialization failed: ${fhevmErrorMessage}`
              : "Initializing FHE encryption layer — this takes a few seconds on first load…"}
          </span>
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
