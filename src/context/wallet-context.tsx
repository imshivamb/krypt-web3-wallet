"use client";
import { createContext, ReactNode, useContext, useState } from "react";

export enum Step {
  WELCOME,
  NETWORK_SELECTION,
  WARNING,
  SEED_PHRASE,
  CREATE_WALLET,
}

interface WalletContextProps {
  step: Step;
  setStep: (step: Step) => void;
  network: "solana" | "ethereum" | null;
  setNetwork: (network: "solana" | "ethereum") => void;
  seedPhrase: string;
  setSeedPhrase: (seedPhrase: string) => void;
  agreed: boolean;
  setAgreed: (agreed: boolean) => void;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [step, setStep] = useState<Step>(Step.WELCOME);
  const [network, setNetwork] = useState<"solana" | "ethereum" | null>(null);
  const [seedPhrase, setSeedPhrase] = useState<string>("");
  const [agreed, setAgreed] = useState<boolean>(false);

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
