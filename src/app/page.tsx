"use client";

import EnhancedWallet from "@/components/EnhancedWallet";
import NetworkSelection from "@/components/NetworkSelection";
import SeedPhrase from "@/components/SeedPhrase";
import Warning from "@/components/Warning";
import WelcomeScreen from "@/components/WelcomeScreen";
import { useWallet } from "@/context/wallet-context";
import { Step } from "@/types/wallet";

export default function Home() {
  const { step } = useWallet();
  return (
    <div className="dark:text-gray-100 text-gray-800 flex min-h-screen flex-col items-center justify-center w-full">
      {step === Step.WELCOME && <WelcomeScreen />}
      {step === Step.NETWORK_SELECTION && <NetworkSelection />}
      {step === Step.WARNING && <Warning />}
      {step === Step.SEED_PHRASE && <SeedPhrase />}
      {step === Step.CREATE_WALLET && <EnhancedWallet />}
    </div>
  );
}
