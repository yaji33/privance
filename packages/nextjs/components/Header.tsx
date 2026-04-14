"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RainbowKitCustomConnectButton } from "~~/components/helper";

export const Header = () => {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <header className={`${isLanding ? "fixed" : "sticky"} top-0 z-30 w-full px-4 pt-4 sm:px-6`}>
      <div className="mx-auto max-w-7xl">
        {isLanding ? (
          <div className="relative flex h-16 items-center justify-between rounded-full border border-white/80 bg-white/92 px-5 shadow-[0_12px_30px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:px-7">
            <Link href="/" className="relative z-10 flex items-center gap-2 select-none">
              <span className="text-[#2563EB] text-lg leading-none">•</span>
              <span className="text-[#0F172A] font-semibold text-xl leading-none tracking-tight">Privance</span>
            </Link>

            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm font-medium text-[#475569] md:flex">
              <a href="#how-it-works" className="hover:text-[#0F172A] transition-colors">How it Works</a>
              <a href="#features" className="hover:text-[#0F172A] transition-colors">Features</a>
              <Link href="/dashboard" className="hover:text-[#0F172A] transition-colors">Dashboard</Link>
            </nav>

            <div className="relative z-10 flex items-center gap-3 sm:gap-4">
              <span className="hidden lg:inline text-sm font-medium text-[#64748B]">Connect to Wallet</span>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)] transition-colors hover:bg-[#1D4ED8]"
              >
                Launch App
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex h-16 items-center justify-between rounded-xl border border-white/85 bg-white/90 px-4 shadow-[0_10px_26px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
            <Link href="/" className="flex items-center gap-2 select-none">
              <div className="w-8 h-8 rounded-lg bg-[#1741D9] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="8" rx="1.5" fill="white" />
                  <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[#0F172A] font-bold text-lg tracking-tight">Privance</span>
            </Link>
            <RainbowKitCustomConnectButton />
          </div>
        )}
      </div>
    </header>
  );
};
