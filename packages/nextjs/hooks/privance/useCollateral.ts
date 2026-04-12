"use client";

import { useCallback, useMemo, useState } from "react";
import { useDeployedContractInfo } from "../helper";
import { useWagmiEthers } from "../wagmi/useWagmiEthers";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useAccount, useReadContract } from "wagmi";

const MOCK_CHAINS = { 31337: "http://localhost:8545" } as const;

export const useCollateral = () => {
  const { address } = useAccount();
  const { ethersSigner } = useWagmiEthers(MOCK_CHAINS);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: collateral } = useDeployedContractInfo({ contractName: "CollateralManager" });
  const hasContract = Boolean(collateral?.address && collateral?.abi);

  const getContract = useCallback(() => {
    if (!hasContract || !ethersSigner) return undefined;
    return new ethers.Contract(collateral!.address, collateral!.abi as any, ethersSigner);
  }, [hasContract, ethersSigner, collateral]);

  const readCfg = useMemo(
    () => ({
      address: hasContract ? (collateral!.address as `0x${string}`) : undefined,
      abi: hasContract ? (collateral!.abi as any) : undefined,
    }),
    [hasContract, collateral],
  );

  const { data: availableCollateral, refetch: refetchAvailable } = useReadContract({
    ...readCfg,
    functionName: "getAvailableCollateral",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(hasContract && address) },
  });

  const { data: totalCollateral, refetch: refetchTotal } = useReadContract({
    ...readCfg,
    functionName: "getUserCollateral",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(hasContract && address) },
  });

  const refetchAll = useCallback(
    () => Promise.all([refetchAvailable(), refetchTotal()]),
    [refetchAvailable, refetchTotal],
  );

  const depositCollateral = useCallback(
    async (ethAmount: string) => {
      const contract = getContract();
      if (!contract || isProcessing) return;
      setIsProcessing(true);
      const tid = toast.loading("Depositing collateral...");
      try {
        const tx = await contract.depositCollateral({ value: ethers.parseEther(ethAmount) });
        await tx.wait();
        await refetchAll();
        toast.success("Collateral deposited!", { id: tid });
      } catch (e: any) {
        toast.error(e?.reason ?? e?.message ?? "Failed to deposit", { id: tid });
      } finally {
        setIsProcessing(false);
      }
    },
    [getContract, isProcessing, refetchAll],
  );

  const withdrawCollateral = useCallback(
    async (ethAmount: string) => {
      const contract = getContract();
      if (!contract || isProcessing) return;
      setIsProcessing(true);
      const tid = toast.loading("Withdrawing collateral...");
      try {
        const tx = await contract.withdrawCollateral(ethers.parseEther(ethAmount));
        await tx.wait();
        await refetchAll();
        toast.success("Collateral withdrawn!", { id: tid });
      } catch (e: any) {
        toast.error(e?.reason ?? e?.message ?? "Failed to withdraw", { id: tid });
      } finally {
        setIsProcessing(false);
      }
    },
    [getContract, isProcessing, refetchAll],
  );

  return {
    collateralAddress: collateral?.address,
    hasContract,
    availableCollateral: availableCollateral as bigint | undefined,
    totalCollateral: totalCollateral as bigint | undefined,
    depositCollateral,
    withdrawCollateral,
    isProcessing,
  };
};
