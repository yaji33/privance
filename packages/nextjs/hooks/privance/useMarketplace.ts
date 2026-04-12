"use client";

import { useCallback, useMemo, useState } from "react";
import { useDeployedContractInfo } from "../helper";
import { useWagmiEthers } from "../wagmi/useWagmiEthers";
import { FhevmInstance, getEncryptionMethod, useFHEDecrypt, useFHEEncryption, useInMemoryStorage } from "@fhevm-sdk";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useAccount, useReadContract } from "wagmi";

const MOCK_CHAINS = { 31337: "http://localhost:8545" } as const;

export const useMarketplace = ({ instance }: { instance: FhevmInstance | undefined }) => {
  const { address } = useAccount();
  const { ethersSigner } = useWagmiEthers(MOCK_CHAINS);
  const { storage: fhevmStorage } = useInMemoryStorage();

  const [isProcessing, setIsProcessing] = useState(false);
  const [scoreHandle, setScoreHandle] = useState<string | undefined>();

  const { data: marketplace } = useDeployedContractInfo({ contractName: "LendingMarketplace" });
  const hasContract = Boolean(marketplace?.address && marketplace?.abi);

  const getContract = useCallback(
    (mode: "read" | "write") => {
      if (!hasContract) return undefined;
      const p = mode === "write" ? ethersSigner : ethersSigner;
      if (!p) return undefined;
      return new ethers.Contract(marketplace!.address, marketplace!.abi as any, p);
    },
    [hasContract, ethersSigner, marketplace],
  );

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

  const { encryptWith } = useFHEEncryption({
    instance,
    ethersSigner: ethersSigner as any,
    contractAddress: marketplace?.address,
  });

  const decryptRequests = useMemo(() => {
    if (!hasContract || !scoreHandle || scoreHandle === ethers.ZeroHash) return undefined;
    return [{ handle: scoreHandle, contractAddress: marketplace!.address }] as const;
  }, [hasContract, scoreHandle, marketplace?.address]);

  const { canDecrypt, decrypt: decryptScore, isDecrypting, results: decryptResults } = useFHEDecrypt({
    instance,
    ethersSigner: ethersSigner as any,
    fhevmDecryptionSignatureStorage: fhevmStorage,
    chainId: undefined,
    requests: decryptRequests,
  });

  const decryptedScore = useMemo(
    () => (scoreHandle ? decryptResults[scoreHandle] : undefined),
    [scoreHandle, decryptResults],
  );

  const computeScore = useCallback(async () => {
    const contract = getContract("write");
    if (!contract || isProcessing) return;
    setIsProcessing(true);
    const tid = toast.loading("Computing your credit score on-chain...");
    try {
      const tx = await contract.computeCreditScore();
      await tx.wait();
      const handle = await contract.getCreditScore();
      setScoreHandle(handle as string);
      await Promise.all([refetchHasScore(), refetchScoreTs()]);
      toast.success("Score computed! Click Decrypt to reveal it.", { id: tid });
    } catch (e: any) {
      toast.error(e?.reason ?? e?.message ?? "Failed to compute score", { id: tid });
    } finally {
      setIsProcessing(false);
    }
  }, [getContract, isProcessing, refetchHasScore, refetchScoreTs]);

  const createLoanRequest = useCallback(
    async (plainAmountEth: string, durationDays: number) => {
      if (!instance || isProcessing) return;
      const plainAmountWei = ethers.parseEther(plainAmountEth);
      const contract = getContract("write");
      if (!contract) return;
      setIsProcessing(true);
      const tid = toast.loading("Encrypting loan amount with FHE...");
      try {
        const method = getEncryptionMethod("externalEuint64") ?? "addUint64";
        const enc = await encryptWith(builder => {
          (builder as any)[method](plainAmountWei);
        });
        if (!enc) throw new Error("FHE encryption failed");
        toast.loading("Submitting loan request...", { id: tid });
        const tx = await contract.createLoanRequest(
          enc.handles[0],
          enc.inputProof,
          plainAmountWei,
          BigInt(durationDays),
        );
        await tx.wait();
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
      const contract = getContract("write");
      if (!contract || isProcessing) return;
      setIsProcessing(true);
      const tid = toast.loading("Cancelling loan request...");
      try {
        const tx = await contract.cancelLoanRequest(loanId);
        await tx.wait();
        toast.success("Loan request cancelled.", { id: tid });
      } catch (e: any) {
        toast.error(e?.reason ?? e?.message ?? "Failed to cancel", { id: tid });
      } finally {
        setIsProcessing(false);
      }
    },
    [getContract, isProcessing],
  );

  const createLenderOffer = useCallback(
    async (
      minScore: number,
      maxAmountEth: string,
      collateralPct: number,
      interestRateBps: number,
      depositEth: string,
    ) => {
      if (!instance || isProcessing) return;
      const maxAmountWei = ethers.parseEther(maxAmountEth);
      const depositWei = ethers.parseEther(depositEth);
      const contract = getContract("write");
      if (!contract) return;
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
          enc.handles[0],
          enc.inputProof,
          enc.handles[1],
          enc.inputProof,
          BigInt(collateralPct),
          BigInt(interestRateBps),
          maxAmountWei,
          { value: depositWei },
        );
        await tx.wait();
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
      const contract = getContract("write");
      if (!contract || isProcessing) return;
      setIsProcessing(true);
      const tid = toast.loading("Cancelling offer...");
      try {
        const tx = await contract.cancelLenderOffer(offerId);
        await tx.wait();
        toast.success("Offer cancelled.", { id: tid });
      } catch (e: any) {
        toast.error(e?.reason ?? e?.message ?? "Failed to cancel", { id: tid });
      } finally {
        setIsProcessing(false);
      }
    },
    [getContract, isProcessing],
  );

  return {
    marketplaceAddress: marketplace?.address,
    hasContract,
    hasCreditScore: Boolean(hasCreditScore),
    scoreTimestamp: scoreTimestamp as bigint | undefined,
    scoreHandle,
    decryptedScore,
    canDecrypt,
    decryptScore,
    isDecrypting,
    computeScore,
    nextLoanId: nextLoanId as bigint | undefined,
    createLoanRequest,
    cancelLoanRequest,
    nextOfferId: nextOfferId as bigint | undefined,
    createLenderOffer,
    cancelLenderOffer,
    isProcessing,
  };
};
