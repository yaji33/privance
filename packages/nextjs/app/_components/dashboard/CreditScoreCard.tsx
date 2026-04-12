"use client";

import { useMarketplace } from "~~/hooks/privance/useMarketplace";

type Props = {
  marketplace: ReturnType<typeof useMarketplace>;
};

const scoreGrade = (score: bigint): { label: string; color: string } => {
  if (score >= 750n) return { label: "Excellent", color: "text-emerald-600" };
  if (score >= 670n) return { label: "Good", color: "text-blue-600" };
  if (score >= 580n) return { label: "Fair", color: "text-amber-600" };
  return { label: "Poor", color: "text-red-500" };
};

const scoreBarWidth = (score: bigint): string => {
  const pct = ((Number(score) - 300) / 550) * 100;
  return `${Math.min(Math.max(pct, 2), 100).toFixed(1)}%`;
};

export const CreditScoreCard = ({ marketplace }: Props) => {
  const { hasCreditScore, scoreTimestamp, decryptedScore, canDecrypt, decryptScore, isDecrypting, computeScore, isProcessing } = marketplace;

  const scoreBigint = typeof decryptedScore === "bigint" ? decryptedScore : undefined;
  const grade = scoreBigint !== undefined ? scoreGrade(scoreBigint) : null;
  const ts = scoreTimestamp ? new Date(Number(scoreTimestamp) * 1000).toLocaleDateString() : null;

  return (
    <div className="bg-white rounded-2xl border border-[#E8EDF8] shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-bold text-[#0F172A] text-lg">Credit Score</h3>
          <p className="text-sm text-[#94A3B8] mt-0.5">Encrypted on-chain via FHE</p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            hasCreditScore
              ? "bg-[#ECFDF5] text-[#10B981] border-[#D1FAE5]"
              : "bg-[#F8FAFF] text-[#94A3B8] border-[#E8EDF8]"
          }`}
        >
          {hasCreditScore ? "Active" : "Not computed"}
        </span>
      </div>

      {scoreBigint !== undefined ? (
        <div className="mb-5">
          <div className="flex items-end gap-2 mb-2">
            <span className="text-6xl font-bold text-[#0B1135] leading-none">{String(scoreBigint)}</span>
            <span className="text-[#94A3B8] text-sm mb-2">/ 850</span>
            {grade && <span className={`text-sm font-semibold mb-2 ${grade.color}`}>{grade.label}</span>}
          </div>
          <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1741D9] to-[#2563EB] transition-all duration-700"
              style={{ width: scoreBarWidth(scoreBigint) }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#CBD5E1] mt-1">
            <span>300</span><span>850</span>
          </div>
        </div>
      ) : (
        <div className="mb-5 flex items-center gap-3 bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
          <div className="w-12 h-12 rounded-xl bg-[#EBF0FF] grid place-items-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="4" y="10" width="14" height="10" rx="2" stroke="#1741D9" strokeWidth="1.6" />
              <path d="M7 10V7.5a4 4 0 0 1 8 0V10" stroke="#1741D9" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">
              {hasCreditScore ? "Score encrypted on-chain" : "No score yet"}
            </p>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {hasCreditScore
                ? "Click Decrypt to reveal your score. Only you can."
                : "Compute your FHE credit score to access lending."}
            </p>
          </div>
        </div>
      )}

      {ts && (
        <p className="text-xs text-[#94A3B8] mb-4">
          Last computed: {ts}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={computeScore}
          disabled={isProcessing}
          className="flex-1 py-2.5 rounded-xl bg-[#1741D9] text-white text-sm font-semibold hover:bg-[#1236BA] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          {isProcessing ? "Computing..." : hasCreditScore ? "Recompute" : "Compute Score"}
        </button>
        {hasCreditScore && (
          <button
            onClick={decryptScore}
            disabled={!canDecrypt || isDecrypting}
            className="flex-1 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#1741D9] text-sm font-semibold hover:bg-[#EBF0FF] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            {isDecrypting ? "Decrypting..." : "Decrypt Score"}
          </button>
        )}
      </div>
    </div>
  );
};
