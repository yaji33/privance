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
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const Hero = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#d8ecff] via-[#6eaefc] to-[#1d67dd] px-4 pb-16 pt-16 text-white sm:px-8 sm:pb-20 sm:pt-24"
    >
      {/* Background layers - Kept from your code */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(96,165,250,0.18)_0%,rgba(21,25,34,0)_70%)]" />
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-[#6eaefc]/55 to-[#e9f3ff]" />
      
      <div className="relative z-10">
        {/* Grid texture - Kept from your code */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:52px_52px]" />
        
        {/* Heading - Kept from your code */}
        <motion.div {...fadeUp(0.2)} className="relative z-10 mx-auto mt-10 max-w-3xl text-center sm:mt-14">
          <h1 className="text-[2.25rem] font-bold leading-[1.08] tracking-tight text-white drop-shadow-sm sm:text-6xl sm:leading-[1.06]">
            Make Private Lending
            <br className="hidden sm:block" />
            <span className="relative inline-block">
              <span className="relative z-10">Fast & Secure with Privance</span>
              <span className="absolute bottom-0.5 left-0 h-[6px] w-full rounded-full bg-white/25 blur-[2px]" />
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-blue-50/90 sm:text-[16.5px]">
            Fully Homomorphic Encryption for secure scoring, matching, and lending —
            <strong className="font-semibold text-white"> without exposing identity or balances.</strong>
          </p>
        </motion.div>

        {/* Buttons - Kept from your code */}
        <motion.div {...fadeUp(0.32)} className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-blue-600 px-7 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(29,103,221,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-200 hover:bg-blue-500 hover:shadow-[0_12px_30px_rgba(29,103,221,0.65)] active:scale-[0.97]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white">
              <LockIcon />
            </span>
            Borrow privately
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </Link>
          <button type="button" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/50 bg-white/15 px-7 text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm transition-all duration-200 hover:bg-white/22 hover:border-white/70 active:scale-[0.97]">
            Become a lender
          </button>
        </motion.div>

        {/* --- NEW ENHANCED GRAPHICS SECTION --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.45, ease: "easeOut" }}
          className="relative z-10 mt-16 grid grid-cols-1 gap-6 [perspective:1500px] md:mt-24 md:grid-cols-[1fr_1.2fr_1fr] md:items-center"
        >
          {/* Left: Market Stats with Curve Perspective */}
          <motion.div 
            whileHover={{ rotateY: 6, x: 6, y: -2 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="hidden origin-right rotate-y-[20deg] flex-col rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl md:flex"
          >
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-blue-100/60">
              <span>Ethereum</span>
              <span>7 days</span>
            </div>
            <div className="mt-2 text-3xl font-bold">47,384</div>
            <div className="mt-8 h-28 w-full">
              <svg viewBox="0 0 100 40" className="h-full w-full stroke-white fill-none opacity-80">
                <path d="M0 35 Q 20 35, 40 20 T 80 25 T 100 5" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0 35 Q 20 35, 40 20 T 80 25 T 100 5 L 100 40 L 0 40 Z" fill="rgba(255,255,255,0.1)" />
              </svg>
            </div>
          </motion.div>

          {/* Center: Main Balance "Vault" (The Hero Card) */}
          <motion.div 
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-20 flex flex-col rounded-[2.5rem] border border-white/30 bg-white/15 p-8 shadow-[0_0_50px_rgba(255,255,255,0.1)] backdrop-blur-2xl"
          >
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100/70">Private Vault Balance</p>
              <h2 className="mt-2 text-4xl font-bold tracking-tighter text-white drop-shadow-md">$ 44,128.94</h2>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-b border-white/10 pb-8">
              <div>
                <div className="flex items-center gap-2 text-[10px] text-blue-50 uppercase font-bold">
                   <div className="h-2 w-2 rounded-full bg-blue-300" /> Active
                </div>
                <div className="mt-1 font-bold text-lg">$ 5,148.42</div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 text-[10px] text-blue-50 uppercase font-bold">
                  Pending <div className="h-2 w-2 rounded-full bg-white/50" />
                </div>
                <div className="mt-1 font-bold text-lg">$ 5,148.42</div>
              </div>
            </div>

            {/* Meter Distribution Bar from Image */}
            <div className="mt-6 flex h-14 items-end justify-between gap-1">
              {[...Array(24)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0.25, opacity: 0.45 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.7 + i * 0.02, ease: "easeOut" }}
                  className={`origin-bottom w-1 rounded-full ${meterHeights[i]} ${i < 14 ? "bg-white" : "bg-white/20"}`}
                />
              ))}
            </div>
            
            <div className="mt-4 flex justify-between text-[10px] font-bold text-blue-50/70 uppercase">
              <span>Utilization 58%</span>
              <span>Available 42%</span>
            </div>

            <button className="mt-8 w-full rounded-2xl border border-white/20 bg-white/10 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:bg-white/20 active:scale-95">
              Deposit Funds
            </button>
          </motion.div>

          {/* Right: Transaction Match UI */}
          <motion.div 
            whileHover={{ rotateY: -6, x: -6, y: -2 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="hidden origin-left -rotate-y-[20deg] flex-col rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl md:flex"
          >
            <div className="mb-6 text-[10px] font-bold text-blue-100/60 uppercase tracking-widest">Quick Match</div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                <div className="text-[10px] text-blue-100/50 uppercase font-bold">Lend</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xl font-bold">1,545</span>
                  <span className="text-[10px] bg-white/20 px-2 py-1 rounded font-bold">USDC</span>
                </div>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <div className="bg-white text-blue-600 p-2 rounded-full shadow-xl">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                    <path d="M7 10l5 5 5-5" />
                  </svg>
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                <div className="text-[10px] text-blue-100/50 uppercase font-bold">Yield Est.</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xl font-bold">10,741.59</span>
                  <span className="text-[10px] bg-white/20 px-2 py-1 rounded font-bold">ANNUAL</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};