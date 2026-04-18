"use client";

import { useMarketplace } from "~~/hooks/privance/useMarketplace";

type Props = {
  marketplace: ReturnType<typeof useMarketplace>;
};

const scoreGrade = (score: bigint): { label: string; color: string } => {
  if (score >= 750n) return { label: "Excellent", color: "text-[#1d67dd]" };
  if (score >= 670n) return { label: "Good", color: "text-[#1d67dd]/80" };
  if (score >= 580n) return { label: "Fair", color: "text-slate-500" };
  return { label: "Poor", color: "text-slate-400" };
};

const scoreBarWidth = (score: bigint): string => {
  const pct = ((Number(score) - 300) / 550) * 100;
  return `${Math.min(Math.max(pct, 2), 100).toFixed(1)}%`;
};

export const CreditScoreCard = ({ marketplace }: Props) => {
  const {
    hasCreditScore,
    scoreTimestamp,
    decryptedScore,
    canDecrypt,
    decryptScore,
    isDecrypting,
    computeScore,
    isProcessing,
  } = marketplace;

  const scoreBigint = typeof decryptedScore === "bigint" ? decryptedScore : undefined;
  const grade = scoreBigint !== undefined ? scoreGrade(scoreBigint) : null;
  const ts = scoreTimestamp
    ? new Date(Number(scoreTimestamp) * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="rounded-2xl border border-[#E8EDF8] bg-white shadow-[0_4px_20px_-8px_rgba(29,103,221,0.08)] p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1d67dd] mb-1">Credit</p>
          <h3 className="font-bold text-[#0F172A] text-[15px]">Credit Score</h3>
          <p className="text-[12px] text-slate-400 mt-0.5">Encrypted on-chain via FHE</p>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            hasCreditScore
              ? "bg-[#e9f3ff] text-[#1d67dd] border-[#1d67dd]/20"
              : "bg-slate-50 text-slate-400 border-slate-200"
          }`}
        >
          {hasCreditScore ? "Active" : "Not computed"}
        </span>
      </div>

      {scoreBigint !== undefined ? (
        <div className="mb-5">
          <div className="flex items-end gap-2.5 mb-3">
            <span className="text-[3.5rem] font-bold text-[#0F172A] leading-none tracking-tight">
              {String(scoreBigint)}
            </span>
            <div className="mb-1.5">
              <span className="text-slate-400 text-[13px]">/ 850</span>
              {grade && (
                <p className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${grade.color}`}>{grade.label}</p>
              )}
            </div>
          </div>

          <div className="w-full h-[5px] bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1d67dd] to-[#6eaefc] transition-all duration-700"
              style={{ width: scoreBarWidth(scoreBigint) }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-slate-300 mt-1.5">
            <span>300</span>
            <span>850</span>
          </div>
        </div>
      ) : (
        <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-4">
          <p className="text-[13px] font-semibold text-[#0F172A]">
            {hasCreditScore ? "Score encrypted on-chain" : "No score yet"}
          </p>
          <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">
            {hasCreditScore
              ? "Click Decrypt to reveal your score. Only you can."
              : "Compute your FHE credit score to access lending."}
          </p>
        </div>
      )}

      {ts && (
        <p className="text-[11px] text-slate-400 mb-4 flex items-center gap-1">
          Last computed: <span className="text-slate-500 font-medium">{ts}</span>
        </p>
      )}

      <div className="flex gap-2.5">
        <button
          onClick={computeScore}
          disabled={isProcessing}
          className="flex-1 py-2.5 rounded-full bg-[#1d67dd] text-white text-[12px] font-bold hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          {isProcessing ? "Computing…" : hasCreditScore ? "Recompute" : "Compute Score"}
        </button>
        {hasCreditScore && (
          <button
            onClick={decryptScore}
            disabled={!canDecrypt || isDecrypting}
            className="flex-1 py-2.5 rounded-full bg-white border border-slate-200 text-[#1d67dd] text-[12px] font-bold hover:bg-[#F8FAFF] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            {isDecrypting ? "Decrypting…" : "Decrypt"}
          </button>
        )}
      </div>
    </div>
  );
};
