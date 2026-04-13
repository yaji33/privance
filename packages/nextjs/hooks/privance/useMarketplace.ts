"use client";

import { useCallback, useMemo, useState } from "react";
import { useDeployedContractInfo } from "../helper";
import { useWagmiEthers } from "../wagmi/useWagmiEthers";
import { FhevmInstance, getEncryptionMethod, useFHEDecrypt, useFHEEncryption, useInMemoryStorage } from "@fhevm-sdk";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useAccount, useReadContract, useReadContracts } from "wagmi";

const MOCK_CHAINS = { 31337: "http://localhost:8545" } as const;
const MAX_LIST_ITEMS = 50;

export type LoanRequest = {
  id: bigint;
  borrower: `0x${string}`;
  requestedAmount: `0x${string}`;
  plainRequestedAmount: bigint;
  plainDuration: bigint;
  timestamp: bigint;
  isActive: boolean;
  isFunded: boolean;
  lender: `0x${string}`;
};

export type LenderOffer = {
  id: bigint;
  lender: `0x${string}`;
  minCreditScore: `0x${string}`;
  maxLoanAmount: `0x${string}`;
  availableFunds: bigint;
  isActive: boolean;
  collateralPercentage: bigint;
  plainInterestRate: bigint;
  plainMaxLoanAmount: bigint;
};

export const useMarketplace = ({
  instance,
  fhevmStatus,
  fhevmError,
}: {
  instance: FhevmInstance | undefined;
  fhevmStatus?: string;
  fhevmError?: unknown;
}) => {
  const { address } = useAccount();
  const { ethersSigner } = useWagmiEthers(MOCK_CHAINS);
  const { storage: fhevmStorage } = useInMemoryStorage();

  const [isProcessing, setIsProcessing] = useState(false);
  const [scoreHandle, setScoreHandle] = useState<string | undefined>();
  const [matchHandle, setMatchHandle] = useState<string | undefined>();
  const [checkedPair, setCheckedPair] = useState<{ loanId: bigint; offerId: bigint } | undefined>();

  const { data: marketplace } = useDeployedContractInfo({ contractName: "LendingMarketplace" });
  const hasContract = Boolean(marketplace?.address && marketplace?.abi);

  const getContract = useCallback(() => {
    if (!hasContract || !ethersSigner) return undefined;
    return new ethers.Contract(marketplace!.address, marketplace!.abi as any, ethersSigner);
  }, [hasContract, ethersSigner, marketplace]);

  const readCfg = useMemo(
    () => ({
      address: hasContract ? (marketplace!.address as `0x${string}`) : undefined,
      abi: hasContract ? (marketplace!.abi as any) : undefined,
    }),
    [hasContract, marketplace],
  );

  const { data: hasCreditScore, refetch: refetchHasScore } = useReadContract({
    ...readCfg,
    functionName: "hasCreditScore",
    account: address,
    query: { enabled: Boolean(hasContract && address) },
  });

  const { data: onChainScoreHandle, refetch: refetchScoreHandle } = useReadContract({
    ...readCfg,
    functionName: "getCreditScore",
    account: address,
    query: { enabled: Boolean(hasContract && address && hasCreditScore) },
  });

  const { data: scoreTimestamp, refetch: refetchScoreTs } = useReadContract({
    ...readCfg,
    functionName: "getScoreTimestamp",
    account: address,
    query: { enabled: Boolean(hasContract && address) },
  });

  const { data: nextLoanId, refetch: refetchLoanId } = useReadContract({
    ...readCfg,
    functionName: "nextLoanId",
    query: { enabled: hasContract },
  });

  const { data: nextOfferId, refetch: refetchOfferId } = useReadContract({
    ...readCfg,
    functionName: "nextOfferId",
    query: { enabled: hasContract },
  });

  const loanCallConfigs = useMemo(() => {
    if (!hasContract || !nextLoanId) return [];
    const count = Math.min(Number(nextLoanId), MAX_LIST_ITEMS);
    return Array.from({ length: count }, (_, i) => ({
      address: marketplace!.address as `0x${string}`,
      abi: marketplace!.abi as any,
      functionName: "loanRequests" as const,
      args: [BigInt(i)] as const,
    }));
  }, [hasContract, nextLoanId, marketplace]);

  const { data: rawLoanData, refetch: refetchLoans } = useReadContracts({
    contracts: loanCallConfigs,
    query: { enabled: hasContract },
  });

  const loanList = useMemo<LoanRequest[]>(() => {
    if (!rawLoanData) return [];
    return rawLoanData.flatMap((item, i) => {
      if (item.status !== "success" || !item.result) return [];
      const r = item.result as any;
      return [{
        id: BigInt(i),
        borrower: r.borrower ?? r[0],
        requestedAmount: r.requestedAmount ?? r[1],
        plainRequestedAmount: r.plainRequestedAmount ?? r[2],
        plainDuration: r.plainDuration ?? r[3],
        timestamp: r.timestamp ?? r[4],
        isActive: r.isActive ?? r[5],
        isFunded: r.isFunded ?? r[6],
        lender: r.lender ?? r[7],
      } as LoanRequest];
    });
  }, [rawLoanData]);

  const offerCallConfigs = useMemo(() => {
    if (!hasContract || !nextOfferId) return [];
    const count = Math.min(Number(nextOfferId), MAX_LIST_ITEMS);
    return Array.from({ length: count }, (_, i) => ({
      address: marketplace!.address as `0x${string}`,
      abi: marketplace!.abi as any,
      functionName: "lenderOffers" as const,
      args: [BigInt(i)] as const,
    }));
  }, [hasContract, nextOfferId, marketplace]);

  const { data: rawOfferData, refetch: refetchOffers } = useReadContracts({
    contracts: offerCallConfigs,
    query: { enabled: hasContract },
  });

  const offerList = useMemo<LenderOffer[]>(() => {
    if (!rawOfferData) return [];
    return rawOfferData.flatMap((item, i) => {
      if (item.status !== "success" || !item.result) return [];
      const r = item.result as any;
      return [{
        id: BigInt(i),
        lender: r.lender ?? r[0],
        minCreditScore: r.minCreditScore ?? r[1],
        maxLoanAmount: r.maxLoanAmount ?? r[2],
        availableFunds: r.availableFunds ?? r[3],
        isActive: r.isActive ?? r[4],
        collateralPercentage: r.collateralPercentage ?? r[5],
        plainInterestRate: r.plainInterestRate ?? r[6],
        plainMaxLoanAmount: r.plainMaxLoanAmount ?? r[7],
      } as LenderOffer];
    });
  }, [rawOfferData]);

  const { encryptWith } = useFHEEncryption({
    instance,
    ethersSigner: ethersSigner as any,
    contractAddress: marketplace?.address,
  });

  const effectiveScoreHandle = scoreHandle ?? (onChainScoreHandle && onChainScoreHandle !== ethers.ZeroHash ? (onChainScoreHandle as string) : undefined);

  const allDecryptRequests = useMemo(() => {
    if (!hasContract || !marketplace?.address) return undefined;
    const reqs: Array<{ handle: string; contractAddress: string }> = [];
    const sh = scoreHandle ?? (onChainScoreHandle && onChainScoreHandle !== ethers.ZeroHash ? (onChainScoreHandle as string) : undefined);
    if (sh && sh !== ethers.ZeroHash)
      reqs.push({ handle: sh, contractAddress: marketplace.address });
    if (matchHandle && matchHandle !== ethers.ZeroHash)
      reqs.push({ handle: matchHandle, contractAddress: marketplace.address });
    return reqs.length > 0 ? (reqs as any) : undefined;
  }, [hasContract, scoreHandle, onChainScoreHandle, matchHandle, marketplace?.address]);

  const { canDecrypt, decrypt, isDecrypting, results: decryptResults } = useFHEDecrypt({
    instance,
    ethersSigner: ethersSigner as any,
    fhevmDecryptionSignatureStorage: fhevmStorage,
    chainId: undefined,
    requests: allDecryptRequests,
  });

  const decryptedScore = useMemo(
    () => (effectiveScoreHandle ? decryptResults[effectiveScoreHandle] : undefined),
    [effectiveScoreHandle, decryptResults],
  );

  const decryptedMatchResult = useMemo(
    () => (matchHandle ? decryptResults[matchHandle] : undefined),
    [matchHandle, decryptResults],
  );

  const computeScore = useCallback(async () => {
    const contract = getContract();
    if (!contract || isProcessing) return;
    setIsProcessing(true);
    const tid = toast.loading("Computing your credit score on-chain...");
    try {
      const tx = await contract.computeCreditScore();
      await tx.wait();
      const handle = await contract.getCreditScore();
      setScoreHandle(handle as string);
      await Promise.all([refetchHasScore(), refetchScoreTs(), refetchScoreHandle()]);
      toast.success("Score computed! Click Decrypt to reveal it.", { id: tid });
    } catch (e: any) {
      toast.error(e?.reason ?? e?.message ?? "Failed to compute score", { id: tid });
    } finally {
      setIsProcessing(false);
    }
  }, [getContract, isProcessing, refetchHasScore, refetchScoreTs, refetchScoreHandle]);

  const createLoanRequest = useCallback(
    async (plainAmountEth: string, durationDays: number) => {
      if (isProcessing) return;
      if (!instance) { toast.error("FHE instance not ready — please wait a moment and try again."); return; }
      const plainAmountWei = ethers.parseEther(plainAmountEth);
      const contract = getContract();
      if (!contract) { toast.error("Wallet not connected or contract unavailable."); return; }
      setIsProcessing(true);
      const tid = toast.loading("Encrypting loan amount with FHE...");
      try {
        const method = getEncryptionMethod("externalEuint64") ?? "addUint64";
        const enc = await encryptWith(builder => {
          (builder as any)[method](plainAmountWei);
        });
        if (!enc) throw new Error("FHE encryption failed");
        toast.loading("Submitting loan request...", { id: tid });
        const tx = await contract.createLoanRequest(enc.handles[0], enc.inputProof, plainAmountWei, BigInt(durationDays) * 86400n);
        await tx.wait();
        await new Promise(r => setTimeout(r, 1000));
        await refetchLoanId();
        toast.success("Loan request submitted!", { id: tid });
      } catch (e: any) {
        toast.error(e?.reason ?? e?.message ?? "Failed to create loan request", { id: tid });
      } finally {
        setIsProcessing(false);
      }
    },
    [instance, isProcessing, getContract, encryptWith, refetchLoanId],
  );

  const cancelLoanRequest = useCallback(
    async (loanId: bigint) => {
      const contract = getContract();
      if (!contract || isProcessing) return;
      setIsProcessing(true);
      const tid = toast.loading("Cancelling loan request...");
      try {
        const tx = await contract.cancelLoanRequest(loanId);
        await tx.wait();
        await refetchLoans();
        toast.success("Loan request cancelled.", { id: tid });
      } catch (e: any) {
        toast.error(e?.reason ?? e?.message ?? "Failed to cancel", { id: tid });
      } finally {
        setIsProcessing(false);
      }
    },
    [getContract, isProcessing, refetchLoans],
  );

  const createLenderOffer = useCallback(
    async (minScore: number, maxAmountEth: string, collateralPct: number, interestRateBps: number, depositEth: string) => {
      if (isProcessing) return;
      if (!instance) { toast.error("FHE instance not ready — please wait a moment and try again."); return; }
      const maxAmountWei = ethers.parseEther(maxAmountEth);
      const depositWei = ethers.parseEther(depositEth);
      const contract = getContract();
      if (!contract) { toast.error("Wallet not connected or contract unavailable."); return; }
      setIsProcessing(true);
      const tid = toast.loading("Encrypting offer parameters with FHE...");
      try {
        const method = getEncryptionMethod("externalEuint64") ?? "addUint64";
        const enc = await encryptWith(builder => {
          (builder as any)[method](BigInt(minScore));
          (builder as any)[method](maxAmountWei);
        });
        if (!enc) throw new Error("FHE encryption failed");
        toast.loading("Submitting lender offer...", { id: tid });
        const tx = await contract.createLenderOffer(
          enc.handles[0], enc.inputProof, enc.handles[1], enc.inputProof,
          BigInt(collateralPct), BigInt(interestRateBps), maxAmountWei,
          { value: depositWei },
        );
        await tx.wait();
        await new Promise(r => setTimeout(r, 1000));
        await refetchOfferId();
        toast.success("Lender offer created!", { id: tid });
      } catch (e: any) {
        toast.error(e?.reason ?? e?.message ?? "Failed to create offer", { id: tid });
      } finally {
        setIsProcessing(false);
      }
    },
    [instance, isProcessing, getContract, encryptWith, refetchOfferId],
  );

  const cancelLenderOffer = useCallback(
    async (offerId: bigint) => {
      const contract = getContract();
      if (!contract || isProcessing) return;
      setIsProcessing(true);
      const tid = toast.loading("Cancelling offer...");
      try {
        const tx = await contract.cancelLenderOffer(offerId);
        await tx.wait();
        await refetchOffers();
        toast.success("Offer cancelled.", { id: tid });
      } catch (e: any) {
        toast.error(e?.reason ?? e?.message ?? "Failed to cancel", { id: tid });
      } finally {
        setIsProcessing(false);
      }
    },
    [getContract, isProcessing, refetchOffers],
  );

  const checkLoanMatch = useCallback(
    async (loanId: bigint, offerId: bigint) => {
      const contract = getContract();
      if (!contract || isProcessing) return;
      setIsProcessing(true);
      const tid = toast.loading("Running encrypted FHE match check on-chain...");
      try {
        const tx = await contract.checkLoanMatch(loanId, offerId);
        await tx.wait();
        const handle = await contract.getMatchResult(loanId, offerId);
        setMatchHandle(handle as string);
        setCheckedPair({ loanId, offerId });
        toast.success("Match check complete. Decrypt to view result.", { id: tid });
      } catch (e: any) {
        toast.error(e?.reason ?? e?.message ?? "Match check failed", { id: tid });
      } finally {
        setIsProcessing(false);
      }
    },
    [getContract, isProcessing],
  );

  const fundLoan = useCallback(
    async (loanId: bigint, offerId: bigint) => {
      const contract = getContract();
      if (!contract || isProcessing) return;
      setIsProcessing(true);
      const tid = toast.loading("Funding loan...");
      try {
        await (contract as any).fundLoan.staticCall(loanId, offerId);
        const tx = await contract.fundLoan(loanId, offerId);
        await tx.wait();
        await Promise.all([refetchLoans(), refetchOffers()]);
        toast.success("Loan funded! Agreement created.", { id: tid });
      } catch (e: any) {
        const reason = e?.reason ?? e?.revert?.args?.[0];
        const msg = reason
          ? reason
          : e?.code === "CALL_EXCEPTION"
          ? "Fund loan failed. Most likely the borrower has insufficient collateral deposited. They must deposit at least (loan amount × collateral %) in the Collateral Vault first."
          : (e?.shortMessage ?? e?.message ?? "Failed to fund loan");
        toast.error(msg, { id: tid });
      } finally {
        setIsProcessing(false);
      }
    },
    [getContract, isProcessing, refetchLoans, refetchOffers],
  );

  const isInstanceReady = fhevmStatus === "ready" ? Boolean(instance && ethersSigner) : Boolean(instance && ethersSigner && fhevmStatus !== "error");
  const isFhevmError = fhevmStatus === "error";

  return {
    marketplaceAddress: marketplace?.address,
    hasContract,
    isInstanceReady,
    isFhevmError,
    fhevmError,
    hasCreditScore: Boolean(hasCreditScore),
    scoreTimestamp: scoreTimestamp as bigint | undefined,
    scoreHandle: effectiveScoreHandle,
    decryptedScore,
    decryptedMatchResult,
    checkedPair,
    matchHandle,
    canDecrypt,
    decrypt,
    decryptScore: decrypt,
    isDecrypting,
    computeScore,
    nextLoanId: nextLoanId as bigint | undefined,
    nextOfferId: nextOfferId as bigint | undefined,
    loanList,
    offerList,
    createLoanRequest,
    cancelLoanRequest,
    createLenderOffer,
    cancelLenderOffer,
    checkLoanMatch,
    fundLoan,
    isProcessing,
  };
};
