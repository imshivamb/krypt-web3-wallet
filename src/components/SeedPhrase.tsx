import { Step, useWallet } from "@/context/wallet-context";
import React, { useEffect, useState } from "react";
import * as bip39 from "bip39";
import { createWallet } from "@/lib/createWallet";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";

type Props = {};

const SeedPhrase = (props: Props) => {
  const { seedPhrase, setWallets, network, setStep, setSeedPhrase } =
    useWallet();
  const [words, setWords] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!seedPhrase) {
      const mnemonic = bip39.generateMnemonic(128);
      setSeedPhrase(mnemonic);
      setWords(mnemonic.split(" "));
    } else {
      setWords(seedPhrase.split(" "));
    }
  }, [seedPhrase, setSeedPhrase]);

  const createFirstWallet = async () => {
    setIsCreating(true);
    if (!network) {
      toast({
        title: "Network Not Selected",
        description: "Please go back and select a network.",
      });
      setIsCreating(false);
      return;
    }
    if (!seedPhrase) {
      toast({
        title: "Seed Phrase Not Generated",
        description: "Please refresh the page and try again.",
      });
      setIsCreating(false);
      return;
    }
    try {
      const newWallet = await createWallet(
        network,
        seedPhrase,
        0,
        `${network.charAt(0).toUpperCase() + network.slice(1)} Wallet 1`
      );
      setWallets([newWallet]);
      setStep(Step.CREATE_WALLET);
      toast({
        title: "Wallet Created",
        description: "Your first wallet has been successfully created.",
      });
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast({
        title: "Wallet Creation Failed",
        description: "Failed to create wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copySeedPhrase = () => {
    navigator.clipboard
      .writeText(words.join(" "))
      .then(() => {
        toast({
          title: "Secret Phrase Copied",
          description: "The secret phrase has been copied to your clipboard.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Copy Failed",
          description: "Failed to copy secret phrase. Please try again.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl px-6 py-5">
      <h1 className="text-3xl lg:text-4xl mb-4 font-bold">
        Secret Recovery Phrase
      </h1>
      <p className="text-center mb-6">
        Write down or copy these words in the correct order and store them
        safely.
      </p>
      <div
        className="rounded-2xl px-6 py-3 dark:bg-gray-900 cursor-pointer border border-gray-800"
        onClick={copySeedPhrase}
      >
        <div className="grid grid-cols-3 gap-4 mt-6  ">
          {words.map((word, index) => (
            <div
              key={index}
              className="bg-gray-100 px-4 py-2 rounded dark:bg-gray-800"
            >
              <span className="font-bold mr-2">{index + 1}.</span> {word}
            </div>
          ))}
        </div>
        <p className="mb-4 w-full flex items-center gap-2 justify-center text-center mt-3 text-sm text-gray-400/50">
          <Copy className="w-4" /> Click anywhere to Copy
        </p>
      </div>
      <Button
        onClick={createFirstWallet}
        disabled={isCreating}
        className="text-base w-full max-w-lg mt-4 p-6 rounded-xl bg-gray-900 dark:bg-gray-100 border-2 border-gray-600 text-white dark:text-gray-800"
      >
        {isCreating ? "Creating Wallet..." : "Create Wallet"}
      </Button>
    </div>
  );
};

export default SeedPhrase;
