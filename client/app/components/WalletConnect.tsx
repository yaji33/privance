"use client";
import { useState } from "react";
import { ethers } from "ethers";

export default function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask not detected!");
      return;
    }

    if (!window.ethereum.isMetaMask) {
      alert("Please use MetaMask to connect.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-900 text-white rounded-2xl shadow-md w-full max-w-sm mx-auto">
      <h1 className="text-lg font-semibold mb-4">MetaMask Connection</h1>
      {account ? (
        <p className="break-all text-sm bg-gray-800 p-2 rounded">
          Connected: {account}
        </p>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition"
        >
          Connect MetaMask
        </button>
      )}
    </div>
  );
}
