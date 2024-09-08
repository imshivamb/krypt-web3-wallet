import { useWallet } from "@/context/wallet-context";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { Step } from "@/types/wallet";

type Props = {};

const NetworkSelection = (props: Props) => {
  const { setStep, setNetwork } = useWallet();
  const handleNetworkChange = (network: "solana" | "ethereum") => {
    setNetwork(network);
    setStep(Step.WARNING);
  };
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg px-6 py-5">
      <h1 className="text-3xl lg:text-4xl mb-4 font-bold">Network Selection</h1>
      <p>
        Krypr supports multiple blockchains. <br /> Choose a Blockchain to get
        started
      </p>

      <div className="mt-10 w-full flex flex-col gap-y-3">
        <Button
          onClick={() => handleNetworkChange("solana")}
          className="flex items-center justify-start gap-4 min-h-[58px] text-lg bg-gray-900 text-gray-50 dark:bg-gray-700 dark:text-gray-100/80 dark:hover:bg-gray-900 transition-all duration-300 ease-in-out rounded-xl"
        >
          <span>
            <Image src="/sol.svg" alt="solana" width={40} height={40} />
          </span>
          Solana
        </Button>
        <Button
          onClick={() => handleNetworkChange("ethereum")}
          className="flex items-center justify-start gap-4 min-h-[58px] text-lg bg-gray-900 text-gray-50 dark:bg-gray-700 dark:text-gray-100/80 dark:hover:bg-gray-900 transition-all duration-300 ease-in-out rounded-xl"
        >
          <span>
            <Image src="/eth.svg" alt="solana" width={40} height={40} />
          </span>
          Ethereum
        </Button>
      </div>
    </div>
  );
};

export default NetworkSelection;
