import { ShipWheel } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { Step, useWallet } from "@/context/wallet-context";

type Props = {};

const WelcomeScreen = (props: Props) => {
  const { setStep } = useWallet();
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <ShipWheel className="w-24 h-24 mb-4" />
        <h1 className="text-3xl lg:text-4xl mb-4 font-bold">
          Welcome to Krypt
        </h1>
        <p className="text-center mb-4 max-w-lg dark:text-gray-500/90">
          Create a new wallet to start your journey into the world of
          decentralized finance and applications.
        </p>
      </div>
      <div className="mt-16">
        <Button
          onClick={() => setStep(Step.NETWORK_SELECTION)}
          className="text-base p-6 rounded-xl bg-gray-900 dark:bg-gray-100 border-2 border-gray-600 text-white dark:text-gray-800"
        >
          Create a new Wallet
        </Button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
