"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay },
});

const steps = [
  {
    step: "01",
    title: "Compute Your Encrypted Score",
    body: "Your repayment history and Aave health factor are processed under FHE. The result is stored on-chain as ciphertext.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Post or Browse Loan Requests",
    body: "Borrowers post encrypted amounts. Lenders set encrypted criteria. Neither party sees the other's raw numbers.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 8h10" />
        <path d="M7 12h10" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Match, Fund, and Repay",
    body: "Compatibility is verified via encrypted FHE comparisons. Once matched, the lender funds the loan instantly.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M16 3h5v5" />
        <path d="M21 3 12 12" />
        <path d="m3 21 9-9" />
      </svg>
    ),
  },
];

const features = [
  {
    title: "Encrypted Credit Scoring",
    body: "Tier 1: Privance repayment history. Tier 2: Aave V3 health factor. Both processed under FHE — your score is a ciphertext, never plaintext.",
  },
  {
    title: "No Intermediary",
    body: "Peer-to-peer. No banks, no oracles, no trusted third parties. Smart contracts enforce rules. FHEVM enforces privacy.",
  },
  {
    title: "Protected Collateral",
    body: "Borrowers lock collateral in a non-custodial vault. On default it auto-liquidates to the lender. No governance, no delay.",
  },
];

export const HowItWorks = () => {
  return (
    <div className="relative overflow-hidden bg-[#e9f3ff]">
      {/* Background Grid - Consistency with Hero Grid Texture */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(29,103,221,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(29,103,221,0.1)_1px,transparent_1px)] [background-size:52px_52px]" />

      {/* SECTION: STEPS */}
      <section id="how-it-works" className="relative pt-24 pb-20 sm:pt-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <motion.div {...fadeUp(0)} className="text-center mb-16">
            <h1 className="text-[2.25rem] font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl">
              How Privance Works
            </h1>
            <p className="mt-4 text-[#1d67dd] font-bold uppercase tracking-[0.2em] text-xs">The FHE Protocol</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={step.step}
                {...fadeUp(0.1 * idx)}
                whileHover={{ y: -8 }}
                className="group relative rounded-[2.5rem] border border-white/60 bg-white/40 p-8 shadow-[0_10px_40px_-15px_rgba(29,103,221,0.1)] backdrop-blur-xl transition-all"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#1d67dd] text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                      {step.icon}
                    </div>
                    <span className="text-5xl font-bold text-slate-900/5 group-hover:text-[#1d67dd]/10 transition-colors">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-[15px]">{step.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: FEATURES */}
      <section id="features" className="relative py-24 sm:py-32">
        {/* NEW: Radial Blue Gradient Background for this part */}
        <div className="absolute left-[-10%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(29,103,221,0.12)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="grid md:grid-cols-[1.1fr_1.9fr] gap-16 items-start">
            <motion.div {...fadeUp(0)} className="md:sticky md:top-32">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl leading-[1.05] mb-8">
                Privacy is the <br />
                <span className="text-[#1d67dd]">Final Product.</span>
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed max-w-sm mb-10">
                Not a marketing claim. An on-chain cryptographic guarantee backed by Zama&apos;s FHEVM.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#1d67dd] px-7 text-[15px] font-semibold text-white shadow-xl transition-all hover:bg-blue-500 active:scale-[0.97]"
              >
                Explore Features
              </Link>
            </motion.div>

            <div className="space-y-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  {...fadeUp(0.1 * i)}
                  whileHover={{ x: 10 }}
                  className="group rounded-[2.5rem] border border-white/60 bg-white/30 p-8 shadow-sm backdrop-blur-md transition-all"
                >
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-full bg-white text-[#1d67dd] font-bold flex items-center justify-center border border-slate-100 group-hover:bg-[#1d67dd] group-hover:text-white transition-all shadow-sm">
                      0{i + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{f.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{f.body}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="relative py-24 sm:py-40 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-6xl mx-auto overflow-hidden rounded-[3.5rem] bg-gradient-to-br from-[#1d67dd] via-[#6eaefc] to-[#1d67dd] px-8 py-24 text-center shadow-[0_40px_100px_-20px_rgba(29,103,221,0.35)]"
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-sky-200/20 blur-[100px] rounded-full" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.p {...fadeUp(0.1)} className="text-blue-50/70 text-xs font-bold tracking-[0.4em] uppercase mb-10">
              Ready to begin?
            </motion.p>

            <motion.h1
              {...fadeUp(0.2)}
              className="text-5xl sm:text-7xl font-bold text-white mb-8 tracking-tighter leading-[0.95] drop-shadow-sm"
            >
              Your finances. <br />
              <span className="text-blue-50/60">Your terms.</span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.3)}
              className="text-white/80 text-lg mb-12 max-w-md mx-auto leading-relaxed font-medium"
            >
              Start today and see how easy private, on-chain repayment can be with Privance.
            </motion.p>

            <motion.div {...fadeUp(0.4)} className="flex justify-center">
              <Link
                href="/dashboard"
                className="group relative flex h-16 items-center gap-3 px-14 bg-white text-[#1d67dd] font-bold text-xl rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Get Started Now
                {/*
                <svg className="transition-transform duration-300 group-hover:translate-x-1.5" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>*/}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
