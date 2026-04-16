import { Hero } from "./_components/landing/Hero";
import { HowItWorks } from "./_components/landing/HowItWorks";
import { TheProblem } from "./_components/landing/TheProblem";
import { ThePrivanceSolution } from "./_components/landing/ThePrivanceSolution";

export default function Home() {
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
