"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/helper";

export const Header = () => {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const isLanding = pathname === "/";

  const isDashboard = pathname === "/dashboard";
  
  const headerTextColor = "text-[#0F172A]";
  const headerNavColor = "text-[#475569]";
  const headerNavHoverColor = "hover:text-[#0F172A]";
  const headerBg = "bg-white/92 shadow-lg shadow-black/5";
  const headerBorder = "border-white/80";

  return (
    <header className="fixed top-0 z-30 w-full px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className={`relative flex h-14 items-center justify-between rounded-full border ${headerBorder} ${headerBg} px-3 backdrop-blur-2xl sm:px-3 shadow-[0_8px_32px_0_rgba(31,38,135,0.07),inset_0_1px_0_rgba(255,255,255,0.9)]`}>
          <Link href="/" className="relative z-10 flex items-center gap-2 select-none">
            <Image src="/privance-logo.svg" alt="Privance Logo" width={42} height={42}/>
            <span className={`${headerTextColor} font-semibold text-xl leading-none tracking-tight`}>Privance</span>
          </Link>

          <nav className={`absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm font-medium ${headerNavColor} md:flex`}>
            {!isConnected ? (
              <>
                <a href="/#problem" className={`${headerNavHoverColor} transition-colors`}>Problem</a>
                <a href="/#solution" className={`${headerNavHoverColor} transition-colors`}>Solution</a>
                <a href="/#features" className={`${headerNavHoverColor} transition-colors`}>Features</a>
              </>
            ) : (
              <>
                <Link href="/dashboard" className={`${headerNavHoverColor} transition-colors ${isDashboard ? `${headerTextColor} font-semibold underline underline-offset-8 decoration-2` : ""}`}>Dashboard</Link>
                <a href="/#features" className={`${headerNavHoverColor} transition-colors`}>Features</a>
              </>
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
