"use client";

import NetworkSelection from "@/components/NetworkSelection";
import Warning from "@/components/Warning";
import WelcomeScreen from "@/components/WelcomeScreen";
import { Step, useWallet } from "@/context/wallet-context";

export default function Home() {
  const { step } = useWallet();
  return (
    <div className="dark:text-gray-100 text-gray-800 flex min-h-screen flex-col items-center justify-center w-full">
      {step === Step.WELCOME && <WelcomeScreen />}
      {step === Step.NETWORK_SELECTION && <NetworkSelection />}
      {step === Step.WARNING && <Warning />}
    </div>
  );
}
