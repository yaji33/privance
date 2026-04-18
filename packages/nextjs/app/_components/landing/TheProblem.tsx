"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

const txRows = [
  {
    hash: "0x4d39c858c3...",
    method: "createLoanRequest",
    block: "21889545",
    age: "9 secs ago",
    from: "0x3f4a...c91b",
    to: "LendingMarketplace",
    amount: "4.2 ETH",
    fee: "0.00000108",
  },
  {
    hash: "0x91ba821150...",
    method: "computeCreditScore",
    block: "21889545",
    age: "9 secs ago",
    from: "0x3f4a...c91b",
    to: "LendingMarketplace",
    amount: "0 ETH",
    fee: "0.00000102",
  },
  {
    hash: "0x3f0b8ec695...",
    method: "createLenderOffer",
    block: "21889544",
    age: "21 secs ago",
    from: "0xA7c2...f314",
    to: "LendingMarketplace",
    amount: "12.0 ETH",
    fee: "0.00000018",
  },
  {
    hash: "0x50422f2db6...",
    method: "checkLoanMatch",
    block: "21889544",
    age: "21 secs ago",
    from: "0xA7c2...f314",
    to: "LendingMarketplace",
    amount: "0 ETH",
    fee: "0.00000169",
  },
  {
    hash: "0xf442669d64...",
    method: "fundLoan",
    block: "21889543",
    age: "34 secs ago",
    from: "0xA7c2...f314",
    to: "0x3f4a...c91b",
    amount: "4.2 ETH",
    fee: "0.00000103",
  },
];

const options = [
  {
    label: "Transparent on-chain",
    tagLabel: "Fully public",
    risks: [
      { src: "/wallet-exposed.png", label: "Wallet exposed" },
      { src: "/mev-bot.png", label: "MEV bots watching" },
      { src: "/credit-score.png", label: "Credit score public" },
      { src: "/counterparty.png", label: "Counterparty visible" },
    ],
  },
  {
    label: "Centralized off-chain",
    tagLabel: "Single point of failure",
    risks: [
      { src: "/bank.png", label: "Bank holds your data" },
      { src: "/censor.png", label: "Can censor anytime" },
      { src: "/rules.png", label: "Rules set by middleman" },
      { src: "/freeze.png", label: "Can freeze position" },
    ],
  },
];

export const TheProblem = () => {
  return (
    <section id="the-problem" className="relative overflow-hidden bg-[#e9f3ff] pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(29,103,221,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(29,103,221,0.12)_1px,transparent_1px)] [background-size:52px_52px]" />
      <div className="absolute right-[-8%] top-1/3 w-[520px] h-[520px] bg-[radial-gradient(circle,rgba(220,38,38,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
        <motion.div {...fadeUp(0)} className="max-w-2xl mb-20">
          <p className="text-[#1d67dd] font-bold uppercase tracking-[0.22em] text-[11px] mb-5">The Problem</p>
          <h2 className="text-[2.6rem] sm:text-[3.5rem] font-bold leading-[1.06] tracking-tight text-slate-900">
            On-chain lending has no{" "}
            <span className="relative inline-block">
              <span className="relative z-10">middle ground.</span>
              <span className="absolute bottom-1 left-0 w-full h-[6px] bg-red-200/60 -z-0 rounded-sm" />
            </span>
          </h2>
          <p className="mt-5 text-slate-500 text-lg leading-relaxed max-w-xl">
            You either expose everything to a public ledger, or hand your data to a middleman. Neither option is
            acceptable for serious capital.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 items-start">
          <motion.div {...fadeUp(0.1)}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              What anyone can see, right now
            </p>
            <div className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-sm overflow-hidden shadow-[0_8px_40px_-12px_rgba(29,103,221,0.12)]">
              <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 ml-2">etherscan.io/txs</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>
                    ETH <span className="text-slate-600 font-medium">$2,358.65</span>
                  </span>
                  <span>
                    Gas <span className="text-[#1d67dd] font-medium">0.047 Gwei</span>
                  </span>
                </div>
              </div>
              <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-slate-200" />
                  <span className="font-bold text-[13px] text-slate-700">Etherscan</span>
                </div>
                <div className="flex gap-3 ml-2 text-[11px] text-slate-400">
                  {["Home", "Blockchain", "Tokens", "More"].map(n => (
                    <span key={n} className={n === "Blockchain" ? "text-[#1d67dd]" : ""}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                <span className="text-[13px] font-bold text-slate-800">Transactions</span>
                <span className="text-[11px] text-slate-400">More than 3,402,040,688 transactions found</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Txn Hash", "Method", "Block", "Age", "From", "To", "Amount", "Txn Fee"].map(h => (
                        <th key={h} className="text-left px-3 py-2.5 font-semibold text-slate-500 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {txRows.map((row, i) => (
                      <motion.tr
                        key={row.hash}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.18 + i * 0.06, duration: 0.4 }}
                        className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="px-3 py-2.5 font-mono text-[#1d67dd] whitespace-nowrap">{row.hash}</td>
                        <td className="px-3 py-2.5">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap">
                            {row.method}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[#1d67dd] font-mono">{row.block}</td>
                        <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap">{row.age}</td>
                        <td className="px-3 py-2.5 font-mono text-[#1d67dd] whitespace-nowrap">{row.from}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-600 whitespace-nowrap">{row.to}</td>
                        <td className="px-3 py-2.5 font-medium text-slate-800 whitespace-nowrap">{row.amount}</td>
                        <td className="px-3 py-2.5 text-slate-400 font-mono">{row.fee}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 border-t border-slate-100 px-4 py-3">
                <p className="text-[11px] text-slate-400">
                  Every transaction — your wallet, loan amount, credit score inputs, counterparty — is indexed and
                  publicly queryable.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4 lg:pt-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              Today&apos;s only options
            </p>

            {options.map((opt, i) => (
              <motion.div
                key={opt.label}
                {...fadeUp(0.15 + i * 0.1)}
                className="rounded-2xl overflow-hidden bg-white/50 border border-[#1d67dd]/10 shadow-[0_4px_20px_-8px_rgba(29,103,221,0.08)] backdrop-blur-sm"
              >
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <span className="text-[13px] font-bold text-slate-800">{opt.label}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#1d67dd]/[0.08] text-[#1d67dd]">
                    {opt.tagLabel}
                  </span>
                </div>

                <div className="mx-5 h-px bg-[#1d67dd]/[0.08]" />

                <div className="grid grid-cols-2 gap-2.5 px-5 py-4">
                  {opt.risks.map(risk => (
                    <div key={risk.label} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 bg-white/60">
                      <div className="w-8 h-8 rounded-lg bg-[#1d67dd]/[0.06] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <Image src={risk.src} alt={risk.label} width={24} height={24} className="object-contain" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 leading-tight">{risk.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            <motion.div
              {...fadeUp(0.35)}
              className="rounded-2xl border border-[#1d67dd]/15 bg-[#1d67dd]/[0.04] px-5 py-4 flex gap-3 items-start"
            >
              <div className="w-[3px] self-stretch rounded-full bg-[#1d67dd]/30 flex-shrink-0" />
              <p className="text-slate-500 text-[12.5px] leading-relaxed">
                Institutional capital stays off-chain. Retail borrowers accept surveillance or forgo access entirely.{" "}
                <span className="text-slate-700 font-semibold">Permissionless finance — broken before it begins.</span>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
