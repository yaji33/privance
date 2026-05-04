"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDeployedContractInfo } from "../helper";
import { useWagmiEthers } from "../wagmi/useWagmiEthers";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useAccount, usePublicClient, useReadContract } from "wagmi";

const MOCK_CHAINS = { 31337: "http://localhost:8545" } as const;

export type Agreement = {
  agreementId: bigint;
  loanId: bigint;
  offerId: bigint;
  borrower: `0x${string}`;
  lender: `0x${string}`;
  principal: bigint;
  interestRate: bigint;
  duration: bigint;
  collateralAmount: bigint;
  totalRepaymentAmount: bigint;
  amountRepaid: bigint;
  dueDate: bigint;
  creationTime: bigint;
  isActive: boolean;
  isRepaid: boolean;
  isDefaulted: boolean;
};

export const useRepaymentTracker = () => {
  const { address } = useAccount();
  const { ethersSigner } = useWagmiEthers(MOCK_CHAINS);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: tracker } = useDeployedContractInfo({ contractName: "RepaymentTracker" });
  const hasContract = Boolean(tracker?.address && tracker?.abi);

  const getContract = useCallback(() => {
    if (!hasContract || !ethersSigner) return undefined;
    return new ethers.Contract(tracker!.address, tracker!.abi as any, ethersSigner);
  }, [hasContract, ethersSigner, tracker]);

  const readCfg = useMemo(
    () => ({
      address: hasContract ? (tracker!.address as `0x${string}`) : undefined,
      abi: hasContract ? (tracker!.abi as any) : undefined,
    }),
    [hasContract, tracker],
  );

  const { data: borrowerIds, refetch: refetchBorrower } = useReadContract({
    ...readCfg,
    functionName: "getBorrowerAgreements",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(hasContract && address) },
  });

  const { data: lenderIds, refetch: refetchLender } = useReadContract({
    ...readCfg,
    functionName: "getLenderAgreements",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(hasContract && address) },
  });

  const myAgreementIds = useMemo<bigint[]>(() => {
    const seen = new Set<string>();
    const ids: bigint[] = [];
    for (const id of [...((borrowerIds as bigint[]) ?? []), ...((lenderIds as bigint[]) ?? [])]) {
      const key = id.toString();
      if (!seen.has(key)) {
        seen.add(key);
        ids.push(id);
      }
    }
    return ids;
  }, [borrowerIds, lenderIds]);

  const publicClient = usePublicClient();
  const [agreements, setAgreements] = useState<Agreement[]>([]);

  const fetchAgreementData = useCallback(async () => {
    if (!hasContract || !address || myAgreementIds.length === 0 || !publicClient || !tracker) {
      setAgreements([]);
      return;
    }
    const results = await Promise.all(
      myAgreementIds.map(async (id) => {
        try {
          const [details, statusStr] = await Promise.all([
            publicClient.readContract({
              address: tracker.address as `0x${string}`,
              abi: tracker.abi as any,
              functionName: "getAgreementDetails",
              args: [id],
              account: address,
            }),
            publicClient.readContract({
              address: tracker.address as `0x${string}`,
              abi: tracker.abi as any,
              functionName: "getAgreementStatus",
              args: [id],
            }),
          ]);
          const r = details as any;
          const s = statusStr as string;
          return {
            agreementId:          id,
            loanId:               0n,
            offerId:              0n,
            borrower:             r.borrower    ?? r[0],
            lender:               r.lender      ?? r[1],
            principal:            r.principal   ?? r[2],
            interestRate:         r.interestRate ?? r[3],
            duration:             0n,
            collateralAmount:     0n,
            totalRepaymentAmount: r.totalDue    ?? r[4],
            amountRepaid:         r.amountPaid  ?? r[5],
            dueDate:              r.dueDate     ?? r[6],
            creationTime:         0n,
            isActive:             r.isActive    ?? r[7],
            isRepaid:             s === "REPAID",
            isDefaulted:          s === "DEFAULTED",
          } as Agreement;
        } catch {
          return null;
        }
      }),
    );
    setAgreements(results.filter(Boolean) as Agreement[]);
  }, [hasContract, address, myAgreementIds, publicClient, tracker]);

  useEffect(() => {
    fetchAgreementData();
  }, [fetchAgreementData]);

  const { data: nextAgreementId } = useReadContract({
    ...readCfg,
    functionName: "nextAgreementId",
    query: { enabled: hasContract },
  });

  const refetchAll = useCallback(
    () => Promise.all([refetchBorrower(), refetchLender(), fetchAgreementData()]),
    [refetchBorrower, refetchLender, fetchAgreementData],
  );

  const makePayment = useCallback(
    async (agreementId: bigint, ethAmount: string) => {
      const contract = getContract();
      if (!contract || isProcessing) return;
      setIsProcessing(true);
      const tid = toast.loading("Processing repayment...");
      try {
        const tx = await contract.makePayment(agreementId, { value: ethers.parseEther(ethAmount) });
        await tx.wait();
        await refetchAll();
        toast.success("Payment made successfully!", { id: tid });
      } catch (e: any) {
        toast.error(e?.reason ?? e?.message ?? "Payment failed", { id: tid });
      } finally {
        setIsProcessing(false);
      }
    },
    [getContract, isProcessing, refetchAll],
  );

  const checkDefault = useCallback(
    async (agreementId: bigint) => {
      const contract = getContract();
      if (!contract || isProcessing) return;
      setIsProcessing(true);
      const tid = toast.loading("Checking default status...");
      try {
        const tx = await contract.checkDefault(agreementId);
        await tx.wait();
        await fetchAgreementData();
        toast.success("Default check complete.", { id: tid });
      } catch (e: any) {
        toast.error(e?.reason ?? e?.message ?? "Check failed", { id: tid });
      } finally {
        setIsProcessing(false);
      }
    },
    [getContract, isProcessing, fetchAgreementData],
  );

  return {
    hasContract,
    nextAgreementId: nextAgreementId as bigint | undefined,
    agreements,
    borrowerIds: borrowerIds as bigint[] | undefined,
    lenderIds: lenderIds as bigint[] | undefined,
    makePayment,
    checkDefault,
    isProcessing,
    refetchAll,
  };
};
