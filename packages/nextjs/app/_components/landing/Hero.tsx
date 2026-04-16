"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: "easeOut" as const },
});

const meterHeights = [
  "h-[28%]", "h-[36%]", "h-[44%]", "h-[52%]", "h-[58%]", "h-[65%]",
  "h-[72%]", "h-[80%]", "h-[62%]", "h-[74%]", "h-[68%]", "h-[84%]",
  "h-[46%]", "h-[54%]", "h-[40%]", "h-[60%]", "h-[50%]", "h-[42%]",
  "h-[64%]", "h-[57%]", "h-[48%]", "h-[38%]", "h-[66%]", "h-[52%]",
];

const LockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const activityItems = [
  {
    type: "Repayment received",
    meta: "Loan #0x3f…a12b · 2h ago",
    amount: "+$420",
    amountColor: "text-white",
  },
  {
    type: "Loan funded",
    meta: "Score matched · ebool decrypted",
    amount: "$1,500",
    amountColor: "text-white",
  },
  {
    type: "Offer pending",
    meta: "FHE match in progress…",
    amount: "$2,340",
    amountColor: "text-white",
  },
];

export const Hero = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#d8ecff] via-[#6eaefc] to-[#1d67dd] px-4 pb-16 pt-16 text-white sm:px-8 sm:pb-20 sm:pt-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(96,165,250,0.18)_0%,rgba(21,25,34,0)_70%)]" />
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-[#6eaefc]/55 to-[#e9f3ff]" />

      <div className="relative z-10">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:52px_52px]" />

        <motion.div {...fadeUp(0.2)} className="relative z-10 mx-auto mt-10 max-w-3xl text-center sm:mt-14">
          <h1 className="text-[2.25rem] font-bold leading-[1.08] tracking-tight text-white drop-shadow-sm sm:text-6xl sm:leading-[1.06]">
            Make Private Lending
            <br className="hidden sm:block" />
            <span className="relative inline-block">
              <span className="relative z-10">Fast & Secure with Privance</span>
              <span className="absolute bottom-0.5 left-0 h-[6px] w-full rounded-full" />
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-blue-50/90 sm:text-[16.5px]">
            Fully Homomorphic Encryption for secure scoring, matching, and lending —
            <strong className="font-semibold text-white"> without exposing identity or balances.</strong>
          </p>
        </motion.div>

        <motion.div {...fadeUp(0.32)} className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-blue-600 px-7 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-blue-500 active:scale-[0.97]"
          >
            Borrow privately
          </Link>
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/50 bg-white/15 px-7 text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm transition-all duration-200 hover:bg-white/22 hover:border-white/70 active:scale-[0.97]"
          >
            Become a lender
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.45, ease: "easeOut" }}
          className="relative z-10 mt-16 flex justify-center md:mt-24"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-full max-w-3xl rounded-[2.5rem] border border-white/30 bg-white/15 p-6 shadow-[0_0_50px_rgba(255,255,255,0.1)] backdrop-blur-2xl sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100/65">
                  Private Vault Balance
                </p>
                <h2 className="mt-2 text-[2.6rem] font-bold tracking-[-0.03em] text-white drop-shadow-md leading-none">
                  $44,128.94
                </h2>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-blue-200/60">
                  <span className="opacity-55"><LockIcon /></span>
                  <span>FHE-encrypted</span>
                </div>
              </div>

            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: "Active", value: "$5,148", sub: "↑ 3 loans", subColor: "text-white" },
                { label: "Pending", value: "$2,340", sub: "Matching…", subColor: "text-white" },
                { label: "Yield (30d)", value: "8.4%", sub: "+$362 earned", subColor: "text-white" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/12 bg-white/9 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100/55">{s.label}</p>
                  <p className="mt-1.5 text-[20px] font-bold text-white leading-none">{s.value}</p>
                  <p className={`mt-1 text-[11px] font-medium ${s.subColor}`}>{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="my-6 h-px bg-white/10" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-100/60">Utilization</p>
                  <p className="text-[11px] font-bold text-white">58%</p>
                </div>
                <div className="flex h-14 items-end justify-between gap-[3px]">
                  {[...Array(24)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0.25, opacity: 0.45 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      transition={{ duration: 0.7, delay: 0.7 + i * 0.02, ease: "easeOut" }}
                      className={`origin-bottom w-1 rounded-full ${meterHeights[i]} ${
                        i < 14 ? "bg-white/85" : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-3 h-[5px] overflow-hidden rounded-full bg-white/12">
                  <div className="h-full w-[58%] rounded-full bg-white/85" />
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-blue-100/50">
                  <span>Utilized 58%</span>
                  <span>Available 42%</span>
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-100/60">
                  Recent Activity
                </p>
                <div className="flex flex-col gap-2">
                  {activityItems.map((item) => (
                    <div
                      key={item.type}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/7 px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-white">{item.type}</p>
                        <p className="truncate text-[10px] text-blue-100/50">{item.meta}</p>
                      </div>
                      <p className={`flex-shrink-0 text-[12px] font-bold ${item.amountColor}`}>
                        {item.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button className="mt-6 w-full rounded-2xl border border-white/20 bg-white/10 py-4 text-[14px] font-bold text-white shadow-lg transition-all duration-300 hover:bg-white/20 active:scale-95">
              Deposit Funds
            </button>
          </motion.div>
        </motion.div>

      </div>
    </motion.section>
  );
};