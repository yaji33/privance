"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/helper";

export type Tab = "borrower" | "lender" | "agreements";
export const DEFAULT_TAB: Tab = "borrower";

export const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "borrower",   label: "Borrower",   icon: "↓" },
  { id: "lender",     label: "Lender",     icon: "↑" },
  { id: "agreements", label: "Agreements", icon: "⇄" },
];

interface HeaderProps {
  agreementCount?: number;
}

const headerTextColor = "text-[#0F172A]";
const headerNavColor  = "text-[#475569]";
const headerNavHover  = "hover:text-[#0F172A]";
const headerBg        = "bg-white/92 shadow-lg shadow-black/5";
const headerBorder    = "border-white/80";

export const Header = ({ agreementCount = 0 }: HeaderProps) => {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const { isConnected } = useAccount();

  const isDashboard = pathname === "/dashboard";
  const activeTab   = isDashboard
    ? ((searchParams.get("tab") as Tab) ?? DEFAULT_TAB)
    : null;

  return (
    <header className="fixed top-0 z-30 w-full px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div
          className={`relative flex h-14 items-center justify-between rounded-full border ${headerBorder} ${headerBg} px-3 backdrop-blur-2xl sm:px-3 shadow-[0_8px_32px_0_rgba(31,38,135,0.07),inset_0_1px_0_rgba(255,255,255,0.9)]`}
        >
          <Link href="/" className="relative z-10 flex items-center select-none">
            <Image src="/privance-logo.svg" alt="Privance Logo" width={42} height={42} />
            <span className={`${headerTextColor} font-semibold text-xl leading-none tracking-tight`}>
              Privance
            </span>
          </Link>

          <nav
            className={`absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 text-sm font-medium ${headerNavColor} md:flex`}
          >
            {!isConnected ? (
              <div className="flex items-center gap-8">
                <a href="/#problem"  className={`${headerNavHover} transition-colors`}>Problem</a>
                <a href="/#solution" className={`${headerNavHover} transition-colors`}>Solution</a>
                <a href="/#features" className={`${headerNavHover} transition-colors`}>Features</a>
              </div>
            ) : (
              TABS.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={`/dashboard?tab=${tab.id}`}
                    className={`
                      flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium
                      transition-all duration-150 select-none
                      ${isActive
                        ? `${headerTextColor} bg-[#F1F5F9]`
                        : `${headerNavColor} ${headerNavHover} hover:bg-[#F8FAFC]`
                      }
                    `}
                  >
                    <span className="text-base leading-none">{tab.icon}</span>
                    {tab.label}
                    {tab.id === "agreements" && agreementCount > 0 && (
                      <span
                        className={`
                          ml-0.5 text-xs px-1.5 py-0.5 rounded-full font-bold leading-none
                          ${isActive
                            ? "bg-[#1741D9] text-white"
                            : "bg-[#EBF0FF] text-[#1741D9]"
                          }
                        `}
                      >
                        {agreementCount}
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </nav>

          <div className="relative z-10 flex items-center gap-3 sm:gap-4">
            <RainbowKitCustomConnectButton forceDark={false} />
          </div>
        </div>
      </div>
    </header>
  );
};