"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

const phases = [
  {
    num: 1,
    actor: "Borrower",
    title: "Compute encrypted score",
    body: "FHE processes on-chain history + Aave health factor. Score stored as euint64 ciphertext — never plaintext.",
    foot: "Score range: 300–850",
    accent: true,
    src: "/phase-1.png",
  },
  {
    num: 2,
    actor: "Lender",
    title: "Post offer with encrypted criteria",
    body: "Min score threshold and max amount are encrypted on submission. The lender's criteria are invisible to all other parties.",
    foot: "Ciphertext in storage",
    accent: true,
    src: "/phase-2.png",
  },
  {
    num: 3,
    actor: "Protocol",
    title: "Match via FHE comparison",
    body: "checkLoanMatch() computes score ≥ min AND amount ≤ max entirely in ciphertext. Result is an ebool — no raw numbers ever exposed.",
    foot: "On-chain, fully private",
    accent: true,
    src: "/phase-3.png",
  },
  {
    num: 4,
    actor: "Lender",
    title: "Decrypt match result, fund loan",
    body: "The lender decrypts only the boolean outcome off-chain. On match, ETH transfers instantly to borrower; collateral locks in the vault.",
    foot: "Instant settlement",
    accent: true,
    src: "/phase-4.png",
  },
];

const features = [
  {
    id: "01",
    src: "/feature-1.png",
    title: "Two-tier encrypted credit score",
    body: "Tier 1 reads Privance repayment history directly from protocol state. Tier 2 reads your Aave V3 health factor — a public view, lifted into FHE. No oracles. No off-chain feeds. Score range: 300–850.",
    stat: "300–850",
    statLabel: "FICO-analogous range",
  },
  {
    id: "02",
    src: "/feature-2.png",
    title: "Non-custodial collateral vault",
    body: "ETH collateral locks at funding via CollateralManager. On full repayment it releases to you automatically. On default it liquidates to the lender — no governance delay, no manual intervention.",
    stat: "0",
    statLabel: "governance touchpoints",
  },
  {
    id: "03",
    src: "/feature-3.png",
    title: "Offers stay live across multiple loans",
    body: "A single lender offer can fund multiple borrowers until liquidity is exhausted. Lenders set criteria once; the protocol matches continuously without re-posting.",
    stat: "1:N",
    statLabel: "offer-to-loan ratio",
  },
  {
    id: "04",
    src: "/feature-4.png",
    title: "Exact-transfer, no MEV surface",
    body: "fundLoan() transfers precisely plainRequestedAmount — not the offer ceiling. Combined with encrypted criteria, there is no extractable price information for MEV bots to front-run.",
    stat: "0 ETH",
    statLabel: "slippage by design",
  },
];

type Point = { x: number; y: number };

const LoanLifecycle = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const drawLines = () => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    if (!wrap || !svg) return;

    const wRect = wrap.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${wRect.width} ${wRect.height}`);
    svg.innerHTML = "";

    const pts: (Point & { isRight: boolean })[] = cardRefs.current.map((c, i) => {
      if (!c) return { x: 0, y: 0, isRight: false };
      const r = c.getBoundingClientRect();
      const isRight = i % 2 === 1;
      return {
        x: isRight ? r.left - wRect.left : r.right - wRect.left,
        y: r.top - wRect.top + r.height * 0.5,
        isRight,
      };
    });

    const ns = "http://www.w3.org/2000/svg";
    const midX = wRect.width / 2;

    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];

      const d =
        !a.isRight && b.isRight
          ? `M ${a.x} ${a.y} C ${midX + 60} ${a.y}, ${midX + 60} ${b.y}, ${b.x} ${b.y}`
          : `M ${a.x} ${a.y} C ${midX - 60} ${a.y}, ${midX - 60} ${b.y}, ${b.x} ${b.y}`;

      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#cbd5e1");
      path.setAttribute("stroke-width", "1.5");
      path.setAttribute("stroke-dasharray", "5 5");
      svg.appendChild(path);

      const dot = document.createElementNS(ns, "circle");
      dot.setAttribute("cx", String(a.x));
      dot.setAttribute("cy", String(a.y));
      dot.setAttribute("r", "4");
      dot.setAttribute("fill", "#1d67dd");
      svg.appendChild(dot);
    }

    const last = pts[pts.length - 1];
    const lastDot = document.createElementNS(ns, "circle");
    lastDot.setAttribute("cx", String(last.x));
    lastDot.setAttribute("cy", String(last.y));
    lastDot.setAttribute("r", "4");
    lastDot.setAttribute("fill", "#1d67dd");
    svg.appendChild(lastDot);
  };

  useEffect(() => {
    const timer = setTimeout(drawLines, 80);
    window.addEventListener("resize", drawLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", drawLines);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full py-8">
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {phases.map((phase, i) => {
        const isRight = i % 2 === 1;
        return (
          <motion.div
            key={phase.num}
            {...fadeUp(0.08 + i * 0.1)}
            className={`relative flex mb-14 ${isRight ? "justify-end" : "justify-start"}`}
            style={{ zIndex: 1 }}
          >
            <div
              ref={(el) => { cardRefs.current[i] = el; }}
              className="w-[420px] bg-white/60 backdrop-blur-sm border border-white/70 rounded-[20px] p-6 cursor-pointer
                        transition-all duration-200 hover:-translate-y-1 hover:border-slate-300
                        shadow-[0_4px_20px_-8px_rgba(29,103,221,0.08)]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
                    phase.accent ? "bg-[#e9f3ff]" : "bg-slate-100"
                  }`}
                >
                  <Image
                    src={phase.src}
                    alt={phase.title}
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[12px] font-semibold flex-shrink-0 text-slate-900"
                    >
                      {phase.num}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      {phase.actor}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-slate-900 leading-snug">
                    {phase.title}
                  </h3>
                </div>
              </div>

              <p className="text-[13px] text-slate-500 leading-relaxed">{phase.body}</p>

              <div
                className={`mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold uppercase tracking-wider ${
                  phase.accent ? "text-[#1d67dd]" : "text-slate-400"
                }`}
              >
                {phase.foot} →
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export const ThePrivanceSolution = () => {
  return (
    <div className="relative overflow-hidden bg-[#e9f3ff]">
      <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(29,103,221,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(29,103,221,0.12)_1px,transparent_1px)] [background-size:52px_52px]" />

      <section id="solution" className="relative pt-24 pb-8 sm:pt-32 sm:pb-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">

          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-12 items-end mb-16">
            <motion.div {...fadeUp(0)}>
              <p className="text-[#1d67dd] font-bold uppercase tracking-[0.22em] text-[11px] mb-5">
                The Privance Solution
              </p>
              <h2 className="text-[2.6rem] sm:text-[3.5rem] font-bold leading-[1.06] tracking-tight text-slate-900">
                Encrypted on both sides.{" "}
                <span className="text-[#1d67dd]">Trustless in the middle.</span>
              </h2>
            </motion.div>

            <motion.div {...fadeUp(0.12)} className="lg:pb-2">
              <p className="text-slate-500 text-lg leading-relaxed">
                Privance uses Zama&apos;s FHEVM to perform credit checks and
                loan matching entirely in the encrypted domain. Scores and
                thresholds are ciphertext in storage — compared without ever
                being decrypted on-chain.
              </p>
            </motion.div>
          </div>

          <motion.p {...fadeUp(0.05)} className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Loan lifecycle
          </motion.p>
          <LoanLifecycle />

        </div>
      </section>

      <section id="features" className="relative py-20 sm:py-28">
        <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(29,103,221,0.09)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid lg:grid-cols-[260px_1fr] gap-16">

            <motion.div {...fadeUp(0)} className="lg:sticky lg:top-32 self-start">
              <p className="text-[#1d67dd] font-bold uppercase tracking-[0.22em] text-[11px] mb-5">
                Features
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
                Built for real capital. Not demos.
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Every design decision optimises for security, capital efficiency, and
                on-chain verifiability — not for marketing slides.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1d67dd] px-6 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-500 active:scale-[0.97]"
              >
                Open Dashboard
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-5">
              {features.map((f, i) => (
                <motion.div
                  key={f.id}
                  {...fadeUp(0.1 + i * 0.07)}
                  whileHover={{ y: -4 }}
                  className="group rounded-3xl border border-white/70 bg-white/40 backdrop-blur-sm p-7 shadow-[0_4px_20px_-8px_rgba(29,103,221,0.08)] transition-all"
                >
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#e9f3ff]`}
                  >
                    <Image
                      src={f.src}
                      alt={f.title}
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[2rem] font-bold text-slate-900 leading-none tracking-tight">
                      {f.stat}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1d67dd] leading-tight mt-1">
                      {f.statLabel}
                    </span>
                  </div>
                </div>

                  <div className="w-8 h-px bg-[#1d67dd]/30 mb-5 group-hover:w-12 transition-all duration-300" />

                  <h3 className="text-base font-bold text-slate-900 mb-3 leading-snug">
                    {f.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 sm:py-36 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-6xl mx-auto overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#1d67dd] via-[#6eaefc] to-[#1d67dd] px-8 py-24 text-center shadow-[0_40px_100px_-20px_rgba(29,103,221,0.35)]"
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-sky-200/20 blur-[100px] rounded-full" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.p {...fadeUp(0.1)} className="text-blue-50/70 text-[11px] font-bold tracking-[0.4em] uppercase mb-8">
              Ready to begin?
            </motion.p>
            <motion.h2 {...fadeUp(0.2)} className="text-5xl sm:text-7xl font-bold text-white mb-6 tracking-tight leading-[0.95]">
              Your finances. <br />
              <span className="text-blue-50/60">Your terms.</span>
            </motion.h2>
            <motion.p {...fadeUp(0.3)} className="text-white/80 text-lg mb-12 max-w-md mx-auto leading-relaxed font-medium">
              Start today and see how easy private, on-chain lending can be with Privance.
            </motion.p>
            <motion.div {...fadeUp(0.4)} className="flex justify-center">
              <Link
                href="/dashboard"
                className="group relative flex h-16 items-center gap-3 px-14 bg-white text-[#1d67dd] font-bold text-xl rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Get Started Now
                <svg
                  className="transition-transform duration-300 group-hover:translate-x-1.5"
                  width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};