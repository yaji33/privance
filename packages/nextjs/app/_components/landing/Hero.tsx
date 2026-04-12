import Link from "next/link";

export const Hero = () => {
  return (
    <section className="bg-[#1741D9] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-[1fr_420px] gap-10 xl:gap-16 items-end pt-16 sm:pt-20">

          <div className="pb-16 lg:pb-28">
            <p className="text-[#93B4FF] text-sm font-medium tracking-wide mb-5">
              Private Lending Protocol on Ethereum
            </p>
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold text-white leading-[1.06] tracking-tight mb-6">
              Lend and Borrow.<br />Complete Privacy.
            </h1>
            <p className="text-[#A8C0FF] text-lg leading-relaxed mb-10 max-w-lg">
              Privance uses Fully Homomorphic Encryption to compute your credit score, match loans, and execute lending — entirely on-chain, without exposing your data.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1741D9] text-sm font-bold rounded-lg hover:bg-[#EBF0FF] active:scale-95 transition-all"
              >
                Launch App
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href="https://sepolia.etherscan.io/address/0x8E9063ffd7645dA6c7e71aC87e7cA4D6E77678ab#code"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/70 text-sm hover:text-white transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M7.5 4.5v3.5M7.5 10.5v.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                View on Etherscan
              </a>
            </div>
          </div>

          <div className="relative lg:translate-y-8 pb-0 self-end">
            <div className="bg-white rounded-t-2xl p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[#94A3B8] text-xs font-medium">Credit Overview</p>
                  <p className="text-[#0F172A] text-sm font-bold mt-0.5">Your Score</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0]">
                  Encrypted
                </span>
              </div>

              <div className="mb-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-[#0F172A]">7</span>
                  <span className="text-4xl font-bold text-[#E2E8F0]">??</span>
                  <span className="text-sm text-[#94A3B8] ml-1">/ 850</span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full mt-3 mb-5">
                <div className="h-full w-[82%] bg-[#1741D9] rounded-full" />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8] font-medium">Available</p>
                  <p className="text-sm font-bold text-[#0F172A] mt-0.5">0.50 ETH</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8] font-medium">Active Loans</p>
                  <p className="text-sm font-bold text-[#0F172A] mt-0.5">0</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-[#F1F5F9]">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="2" y="5" width="8" height="6" rx="1" stroke="#94A3B8" strokeWidth="1.2" />
                  <path d="M4 5V4a2 2 0 0 1 4 0v1" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span className="text-[10px] text-[#94A3B8]">Only you can decrypt your score</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
