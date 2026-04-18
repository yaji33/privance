"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "./_components/landing/Hero";
import { ThePrivanceSolution } from "./_components/landing/ThePrivanceSolution";
import { TheProblem } from "./_components/landing/TheProblem";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.replace("/dashboard");
    }
  }, [isConnected, router]);

  if (isConnected) {
    return null;
  }

  return (
    <div className="w-full">
      <Hero />
      <TheProblem />
      <ThePrivanceSolution />
      <footer className="bg-white border-t border-[#E8EDF8] py-8 text-center text-sm text-[#94A3B8]">
        <span className="font-semibold text-[#475569]">Privance</span> — Privacy-preserving P2P Lending on Ethereum.
        Built for{" "}
        <a
          href="https://zama.ai/developer-hub"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1741D9] hover:underline"
        >
          Zama Developer Program
        </a>
        .
      </footer>
    </div>
  );
}
