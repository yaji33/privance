"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RainbowKitCustomConnectButton } from "~~/components/helper";

export const Header = () => {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E8EDF8] bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded-lg bg-[#1741D9] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="8" rx="1.5" fill="white" />
              <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[#0F172A] font-bold text-lg tracking-tight">Privance</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#475569]">
          {isLanding && (
            <>
              <a href="#how-it-works" className="hover:text-[#0F172A] transition-colors">How it Works</a>
              <a href="#features" className="hover:text-[#0F172A] transition-colors">Features</a>
            </>
          )}
          <Link
            href="/dashboard"
            className="hover:text-[#0F172A] transition-colors"
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isLanding && (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#1741D9] rounded-lg hover:bg-[#1236BA] transition-colors"
            >
              Launch App
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          )}
          <RainbowKitCustomConnectButton />
        </div>
      </div>
    </header>
  );
};
