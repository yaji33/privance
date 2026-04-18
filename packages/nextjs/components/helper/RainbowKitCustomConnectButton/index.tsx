"use client";

import { Balance } from "../Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address } from "viem";
import { useTargetNetwork } from "~~/hooks/helper/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/helper";

export const RainbowKitCustomConnectButton = ({ forceDark }: { forceDark?: boolean }) => {
  const { targetNetwork } = useTargetNetwork();

  const textColor = forceDark ? "text-white/90" : "text-[#0F172A]";
  const subTextColor = forceDark ? "text-white/50" : "text-[#64748B]";
  const btnBg = forceDark
    ? "bg-white/15 hover:bg-white/25 border-white/20"
    : "bg-[#0F172A]/5 hover:bg-[#0F172A]/10 border-[#0F172A]/10";
  const btnTextColor = forceDark ? "text-white" : "text-[#0F172A]";

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(targetNetwork, account.address)
          : undefined;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button
                    className={`px-5 py-2.5 ${btnBg} ${btnTextColor} text-sm font-semibold rounded-full border backdrop-blur-sm transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]`}
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              return (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end mr-1">
                    <Balance
                      address={account.address as Address}
                      className={`min-h-0 h-auto font-medium text-[13px] ${textColor}`}
                    />
                    <span className={`text-[10px] uppercase tracking-wider ${subTextColor}`}>{chain.name}</span>
                  </div>
                  <AddressInfoDropdown
                    address={account.address as Address}
                    displayName={account.displayName}
                    ensAvatar={account.ensAvatar}
                    blockExplorerAddressLink={blockExplorerAddressLink}
                    forceDark={forceDark}
                  />
                </div>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
