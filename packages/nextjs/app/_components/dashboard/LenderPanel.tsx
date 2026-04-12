"use client";

import { useState } from "react";
import { useMarketplace } from "~~/hooks/privance/useMarketplace";

type Props = {
  marketplace: ReturnType<typeof useMarketplace>;
};

export const LenderPanel = ({ marketplace }: Props) => {
  const { nextOfferId, createLenderOffer, cancelLenderOffer, isProcessing } = marketplace;

  const [minScore, setMinScore] = useState("500");
  const [maxAmount, setMaxAmount] = useState("0.1");
  const [collateralPct, setCollateralPct] = useState("5000");
  const [interestBps, setInterestBps] = useState("500");
  const [deposit, setDeposit] = useState("0.5");

  const [offerIdToCancel, setOfferIdToCancel] = useState("");
  const [matchLoanId, setMatchLoanId] = useState("");
  const [matchOfferId, setMatchOfferId] = useState("");
  const [fundLoanId, setFundLoanId] = useState("");
  const [fundOfferId, setFundOfferId] = useState("");

  const handleCreateOffer = async () => {
    if (!minScore || !maxAmount || !deposit) return;
    await createLenderOffer(
      parseInt(minScore),
      maxAmount,
      parseInt(collateralPct),
      parseInt(interestBps),
      deposit,
    );
    setDeposit("");
  };

  const handleCancelOffer = async () => {
    if (!offerIdToCancel) return;
    await cancelLenderOffer(BigInt(offerIdToCancel));
    setOfferIdToCancel("");
  };

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-sm font-medium text-[#374151] mb-1.5">{children}</label>
  );

  const Input = ({
    value,
    onChange,
    placeholder,
    type = "number",
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
  }) => (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1741D9]/20 focus:border-[#1741D9]"
    />
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E8EDF8] shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-bold text-[#0F172A] text-lg">Create Lender Offer</h3>
            <p className="text-sm text-[#94A3B8] mt-0.5">
              Min score & max amount are encrypted via FHE before submission
            </p>
          </div>
          {nextOfferId !== undefined && (
            <span className="text-xs text-[#94A3B8] bg-[#F8FAFF] border border-[#E8EDF8] px-2.5 py-1 rounded-full">
              Next ID: #{String(nextOfferId)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <FieldLabel>Min Credit Score (300–850)</FieldLabel>
            <Input value={minScore} onChange={setMinScore} placeholder="e.g. 500" />
          </div>
          <div>
            <FieldLabel>Max Loan Amount (ETH)</FieldLabel>
            <Input value={maxAmount} onChange={setMaxAmount} placeholder="e.g. 0.1" />
          </div>
          <div>
            <FieldLabel>Collateral Req. (basis pts)</FieldLabel>
            <Input value={collateralPct} onChange={setCollateralPct} placeholder="5000 = 50%" />
            <p className="text-xs text-[#94A3B8] mt-1">5000 = 50% of loan amount required</p>
          </div>
          <div>
            <FieldLabel>Interest Rate (basis pts)</FieldLabel>
            <Input value={interestBps} onChange={setInterestBps} placeholder="500 = 5%" />
            <p className="text-xs text-[#94A3B8] mt-1">500 = 5% annualised</p>
          </div>
        </div>

        <div className="mb-5">
          <FieldLabel>Deposit ETH (funds the offer pool)</FieldLabel>
          <Input value={deposit} onChange={setDeposit} placeholder="e.g. 0.5" />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-4 px-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="2" y="5" width="8" height="6" rx="1" stroke="#94A3B8" strokeWidth="1.2" />
            <path d="M4 5V4a2 2 0 0 1 4 0v1" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Min score & max amount are encrypted with FHE — borrowers never see your thresholds
        </div>

        <button
          onClick={handleCreateOffer}
          disabled={isProcessing || !minScore || !maxAmount || !deposit}
          className="w-full py-3 bg-[#1741D9] text-white text-sm font-semibold rounded-xl hover:bg-[#1236BA] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          {isProcessing ? "Encrypting & Submitting..." : "Create Lender Offer"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E8EDF8] shadow-sm p-6">
          <h3 className="font-bold text-[#0F172A] mb-1">Check Loan Match</h3>
          <p className="text-xs text-[#94A3B8] mb-4">
            Runs encrypted FHE comparison — result stored on-chain for lender to decrypt
          </p>
          <div className="space-y-3 mb-4">
            <Input value={matchLoanId} onChange={setMatchLoanId} placeholder="Loan ID" />
            <Input value={matchOfferId} onChange={setMatchOfferId} placeholder="Offer ID" />
          </div>
          <button
            disabled={isProcessing || !matchLoanId || !matchOfferId}
            className="w-full py-2.5 bg-[#EBF0FF] text-[#1741D9] text-sm font-semibold rounded-xl hover:bg-[#D8E3FF] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            Run Match Check
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8EDF8] shadow-sm p-6">
          <h3 className="font-bold text-[#0F172A] mb-1">Fund Loan</h3>
          <p className="text-xs text-[#94A3B8] mb-4">
            After verifying match off-chain, fund the borrower directly
          </p>
          <div className="space-y-3 mb-4">
            <Input value={fundLoanId} onChange={setFundLoanId} placeholder="Loan ID" />
            <Input value={fundOfferId} onChange={setFundOfferId} placeholder="Offer ID" />
          </div>
          <button
            disabled={isProcessing || !fundLoanId || !fundOfferId}
            className="w-full py-2.5 bg-[#ECFDF5] text-[#059669] text-sm font-semibold rounded-xl hover:bg-[#D1FAE5] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            Fund Loan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EDF8] shadow-sm p-6">
        <h3 className="font-bold text-[#0F172A] mb-4">Cancel Offer</h3>
        <div className="flex gap-3">
          <Input value={offerIdToCancel} onChange={setOfferIdToCancel} placeholder="Offer ID to cancel" />
          <button
            onClick={handleCancelOffer}
            disabled={isProcessing || !offerIdToCancel}
            className="px-5 py-2.5 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
