"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { useMarketplace } from "~~/hooks/privance/useMarketplace";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~~/components/ui/select";

const fmtEth = (wei: bigint | undefined) =>
  wei !== undefined ? `${parseFloat(ethers.formatEther(wei)).toFixed(4)} ETH` : "—";
const fmtAddr = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;
const fmtBps = (bps: bigint) => `${(Number(bps) / 100).toFixed(2)}%`;
const fmtDays = (secs: bigint) => `${Math.round(Number(secs) / 86400)}d`;

const inputCls =
  "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-[#0F172A] placeholder-slate-300 bg-white focus:outline-none focus:border-[#1d67dd] transition-all";

type Props = { marketplace: ReturnType<typeof useMarketplace> };

const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-[#E8EDF8] bg-white shadow-[0_4px_20px_-8px_rgba(29,103,221,0.08)] p-6 ${className}`}>{children}</div>
);

const SectionHeader = ({ title, sub, badge }: { title: string; sub?: string; badge?: string }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1d67dd] mb-1">
        Lender
      </p>
      <h3 className="font-bold text-[#0F172A] text-[15px]">{title}</h3>
      {sub && <p className="text-[12px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
    {badge && (
      <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full shrink-0 mt-0.5">
        {badge}
      </span>
    )}
  </div>
);

export const LenderPanel = ({ marketplace }: Props) => {
  const { address } = useAccount();
  const {
    loanList, offerList, nextOfferId,
    createLenderOffer, cancelLenderOffer,
    checkLoanMatch, fundLoan,
    canDecrypt, decrypt, isDecrypting,
    decryptedMatchResult, checkedPair,
    isProcessing, isInstanceReady, isFhevmError,
  } = marketplace;

  const [minScore, setMinScore]       = useState("500");
  const [maxAmount, setMaxAmount]     = useState("0.1");
  const [collateralPct, setCollateral] = useState("5000");
  const [interestBps, setInterest]    = useState("500");
  const [deposit, setDeposit]         = useState("0.5");

  const [selectedLoanId, setSelectedLoanId]   = useState("");
  const [selectedOfferId, setSelectedOfferId] = useState("");

  const activeLoans  = useMemo(() => loanList.filter(l => l.isActive && !l.isFunded), [loanList]);
  const myOffers     = useMemo(() => offerList.filter(o => o.lender?.toLowerCase() === address?.toLowerCase()), [offerList, address]);
  const activeOffers = useMemo(() => myOffers.filter(o => o.isActive), [myOffers]);

  const matchIsCompatible =
    checkedPair &&
    selectedLoanId === String(checkedPair.loanId) &&
    selectedOfferId === String(checkedPair.offerId) &&
    typeof decryptedMatchResult === "boolean"
      ? decryptedMatchResult
      : undefined;

  const handleCreateOffer = async () => {
    await createLenderOffer(parseInt(minScore), maxAmount, parseInt(collateralPct), parseInt(interestBps), deposit);
    setDeposit("");
  };

  const handleCheckMatch = () => {
    if (!selectedLoanId || !selectedOfferId) return;
    checkLoanMatch(BigInt(selectedLoanId), BigInt(selectedOfferId));
  };

  const handleFund = () => {
    if (!selectedLoanId || !selectedOfferId) return;
    fundLoan(BigInt(selectedLoanId), BigInt(selectedOfferId));
  };

  return (
    <div className="space-y-5">
      <SectionCard>
        <SectionHeader
          title="Active Loan Requests"
          sub="Unfunded loan requests from borrowers you can potentially match"
          badge={`${activeLoans.length} active`}
        />
        {activeLoans.length === 0 ? (
          <p className="text-sm text-[#94A3B8] py-4 text-center">No active loan requests yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-[#F1F5F9]">
                  {["ID", "Borrower", "Amount", "Duration", "Action"].map(h => (
                    <th key={h} className="pb-2.5 text-left text-xs font-semibold text-[#94A3B8] px-1">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeLoans.map(loan => (
                  <tr key={String(loan.id)} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-1 font-mono text-xs text-[#64748B]">#{String(loan.id)}</td>
                    <td className="py-3 px-1 font-mono text-xs text-[#0F172A]">{fmtAddr(loan.borrower)}</td>
                    <td className="py-3 px-1 text-[#0F172A] font-medium">{fmtEth(loan.plainRequestedAmount)}</td>
                    <td className="py-3 px-1 text-[#64748B]">{fmtDays(loan.plainDuration)}</td>
                    <td className="py-3 px-1">
                      <button
                        onClick={() => { setSelectedLoanId(String(loan.id)); }}
                        className="text-xs font-semibold text-[#1741D9] hover:underline"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader
          title="Create Lender Offer"
          sub="Min score & max amount are FHE-encrypted before submission"
          badge={nextOfferId !== undefined ? `Next ID: #${String(nextOfferId)}` : undefined}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">Min Credit Score</label>
            <input type="number" value={minScore} onChange={e => setMinScore(e.target.value)} placeholder="e.g. 500" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">Max Loan Amount (ETH)</label>
            <input type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} placeholder="e.g. 0.1" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">Collateral Req. <span className="text-[#94A3B8] font-normal">(bps — 5000 = 50%)</span></label>
            <input type="number" value={collateralPct} onChange={e => setCollateral(e.target.value)} placeholder="5000" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">Interest Rate <span className="text-[#94A3B8] font-normal">(bps — 500 = 5%)</span></label>
            <input type="number" value={interestBps} onChange={e => setInterest(e.target.value)} placeholder="500" className={inputCls} />
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">Deposit ETH <span className="text-[#94A3B8] font-normal">(funds the offer pool)</span></label>
          <input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} placeholder="e.g. 0.5" className={inputCls} />
        </div>
        <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-4">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="2" y="5" width="8" height="6" rx="1" stroke="#94A3B8" strokeWidth="1.2" />
            <path d="M4 5V4a2 2 0 0 1 4 0v1" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Score threshold & loan cap encrypted with FHE — borrowers cannot see your criteria
        </div>
        <button
          onClick={handleCreateOffer}
          disabled={isProcessing || !isInstanceReady || !minScore || !maxAmount || !deposit}
          className="w-full py-3 bg-[#1741D9] text-white text-sm font-semibold rounded-full hover:bg-[#1236BA] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          {isFhevmError ? "FHE Unavailable" : !isInstanceReady ? "Initializing FHE..." : isProcessing ? "Encrypting & Submitting..." : "Create Lender Offer"}
        </button>
      </SectionCard>

      <SectionCard>
        <SectionHeader title="My Active Offers" badge={`${activeOffers.length} offer${activeOffers.length !== 1 ? "s" : ""}`} />
        {activeOffers.length === 0 ? (
          <p className="text-sm text-[#94A3B8] py-4 text-center">You have no active offers.</p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-[#F1F5F9]">
                  {["ID", "Available", "Max Loan", "Collateral", "Interest", ""].map(h => (
                    <th key={h} className="pb-2.5 text-left text-xs font-semibold text-[#94A3B8] px-1">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeOffers.map(offer => (
                  <tr key={String(offer.id)} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-1 font-mono text-xs text-[#64748B]">#{String(offer.id)}</td>
                    <td className="py-3 px-1 font-medium text-[#0F172A]">{fmtEth(offer.availableFunds)}</td>
                    <td className="py-3 px-1 text-[#64748B]">{fmtEth(offer.plainMaxLoanAmount)}</td>
                    <td className="py-3 px-1 text-[#64748B]">{fmtBps(offer.collateralPercentage)}</td>
                    <td className="py-3 px-1 text-[#64748B]">{fmtBps(offer.plainInterestRate)}</td>
                    <td className="py-3 px-1">
                      <button
                        onClick={() => cancelLenderOffer(offer.id)}
                        disabled={isProcessing}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-40"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader
          title="Check Match & Fund"
          sub="Select a loan request and one of your offers. The FHE comparison runs on-chain."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5 font-bold uppercase tracking-[0.12em] text-slate-500">Loan Request</label>
            <Select value={selectedLoanId} onValueChange={(val) => setSelectedLoanId(val ?? "")}>
              <SelectTrigger className="w-full h-[41px] border border-slate-200 rounded-xl px-3.5 text-[13px] text-[#0F172A] bg-white focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-[#1d67dd] shadow-none data-[size=default]:h-[41px]">
                <SelectValue placeholder="Select a loan request…" className="text-[#0F172A] opacity-100" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-lg">
                {activeLoans.map(l => (
                  <SelectItem key={String(l.id)} value={String(l.id)} className="focus:bg-[#1d67dd] focus:text-white cursor-pointer text-[#0F172A] py-2.5">
                    #{String(l.id)} — {fmtEth(l.plainRequestedAmount)} · {fmtDays(l.plainDuration)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5 font-bold uppercase tracking-[0.12em] text-slate-500">Your Offer</label>
            <Select value={selectedOfferId} onValueChange={(val) => setSelectedOfferId(val ?? "")}>
              <SelectTrigger className="w-full h-[41px] border border-slate-200 rounded-xl px-3.5 text-[13px] text-[#0F172A] bg-white focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-[#1d67dd] shadow-none data-[size=default]:h-[41px]">
                <SelectValue placeholder="Select your offer…" className="text-[#0F172A] opacity-100" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-lg">
                {activeOffers.map(o => (
                  <SelectItem key={String(o.id)} value={String(o.id)} className="focus:bg-[#1d67dd] focus:text-white cursor-pointer text-[#0F172A] py-2.5">
                    #{String(o.id)} — {fmtEth(o.availableFunds)} available
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {checkedPair && selectedLoanId === String(checkedPair.loanId) && selectedOfferId === String(checkedPair.offerId) && (
          <div className={`mb-5 flex items-center gap-3 rounded-xl p-3.5 border text-sm font-medium ${
            matchIsCompatible === true
              ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]"
              : matchIsCompatible === false
              ? "bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]"
              : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
          }`}>
            <span className="text-lg">
              {matchIsCompatible === true ? "✓" : matchIsCompatible === false ? "✗" : "🔐"}
            </span>
            {matchIsCompatible === true
              ? "Match confirmed — you can fund this loan."
              : matchIsCompatible === false
              ? "Not compatible — borrower doesn't meet your criteria."
              : "Match result encrypted. Click Decrypt to reveal."}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCheckMatch}
            disabled={isProcessing || !selectedLoanId || !selectedOfferId}
            className="flex-1 py-2.5 bg-[#EBF0FF] text-[#1741D9] text-sm font-semibold rounded-full hover:bg-[#D8E3FF] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all min-w-[140px]"
          >
            {isProcessing ? "Checking…" : "Check Match (FHE)"}
          </button>
          {checkedPair && typeof decryptedMatchResult === "undefined" && (
            <button
              onClick={decrypt}
              disabled={!canDecrypt || isDecrypting}
              className="flex-1 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-sm font-semibold rounded-xl hover:bg-[#EBF0FF] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all min-w-[140px]"
            >
              {isDecrypting ? "Decrypting…" : "Decrypt Result"}
            </button>
          )}
          {matchIsCompatible === true && (
            <button
              onClick={handleFund}
              disabled={isProcessing}
              className="flex-1 py-2.5 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] text-sm font-semibold rounded-xl hover:bg-[#DCFCE7] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all min-w-[140px]"
            >
              {isProcessing ? "Funding…" : "Fund Loan"}
            </button>
          )}
        </div>
      </SectionCard>
    </div>
  );
};
