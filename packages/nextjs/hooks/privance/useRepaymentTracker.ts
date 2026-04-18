"use client";

import { useCallback, useMemo, useState } from "react";
import { useDeployedContractInfo } from "../helper";
import { useWagmiEthers } from "../wagmi/useWagmiEthers";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useAccount, useReadContract, useReadContracts } from "wagmi";

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

  const agreementCallConfigs = useMemo(() => {
    if (!hasContract || myAgreementIds.length === 0) return [];
    return myAgreementIds.map(id => ({
      address: tracker!.address as `0x${string}`,
      abi: tracker!.abi as any,
      functionName: "agreements" as const,
      args: [id] as const,
    }));
  }, [hasContract, myAgreementIds, tracker]);

  const { data: rawAgreements, refetch: refetchAgreements } = useReadContracts({
    contracts: agreementCallConfigs,
    query: { enabled: agreementCallConfigs.length > 0 },
  });

  const agreements = useMemo<Agreement[]>(() => {
    if (!rawAgreements) return [];
    return rawAgreements.flatMap((item, i) => {
      if (item.status !== "success" || !item.result) return [];
      const r = item.result as any;
      return [
        {
          agreementId: myAgreementIds[i],
          loanId: r.loanId ?? r[1],
          offerId: r.offerId ?? r[2],
          borrower: r.borrower ?? r[3],
          lender: r.lender ?? r[4],
          principal: r.principal ?? r[5],
          interestRate: r.interestRate ?? r[6],
          duration: r.duration ?? r[7],
          collateralAmount: r.collateralAmount ?? r[8],
          totalRepaymentAmount: r.totalRepaymentAmount ?? r[9],
          amountRepaid: r.amountRepaid ?? r[10],
          dueDate: r.dueDate ?? r[11],
          creationTime: r.creationTime ?? r[12],
          isActive: r.isActive ?? r[13],
          isRepaid: r.isRepaid ?? r[14],
          isDefaulted: r.isDefaulted ?? r[15],
        } as Agreement,
      ];
    });
  }, [rawAgreements, myAgreementIds]);

  const { data: nextAgreementId } = useReadContract({
    ...readCfg,
    functionName: "nextAgreementId",
    query: { enabled: hasContract },
  });

  const refetchAll = useCallback(
    () => Promise.all([refetchBorrower(), refetchLender(), refetchAgreements()]),
    [refetchBorrower, refetchLender, refetchAgreements],
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
        await refetchAgreements();
        toast.success("Default check complete.", { id: tid });
      } catch (e: any) {
        toast.error(e?.reason ?? e?.message ?? "Check failed", { id: tid });
      } finally {
        setIsProcessing(false);
      }
    },
    [getContract, isProcessing, refetchAgreements],
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
