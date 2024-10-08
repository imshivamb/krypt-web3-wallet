"use client";
import { Step, Wallet, NetworkType } from "@/types/wallet";
import { createContext, ReactNode, useContext, useState } from "react";

interface WalletContextProps {
  step: Step;
  setStep: (step: Step) => void;
  network: NetworkType | null;
  setNetwork: (network: NetworkType | null) => void;
  seedPhrase: string;
  setSeedPhrase: (seedPhrase: string) => void;
  agreed: boolean;
  setAgreed: (agreed: boolean) => void;
  wallets: Wallet[];
  setWallets: (wallets: Wallet[]) => void;
  addWallet: (wallet: Wallet) => void;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [step, setStep] = useState<Step>(Step.WELCOME);
  const [network, setNetwork] = useState<NetworkType | null>(null);
  const [seedPhrase, setSeedPhrase] = useState<string>("");
  const [agreed, setAgreed] = useState<boolean>(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  const addWallet = (wallet: Wallet) => {
    setWallets((prevWallets) => [...prevWallets, wallet]);
  };

  return (
    <WalletContext.Provider
      value={{
        step,
        setStep,
        network,
        setNetwork,
        seedPhrase,
        setSeedPhrase,
        agreed,
        setAgreed,
        wallets,
        setWallets,
        addWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
