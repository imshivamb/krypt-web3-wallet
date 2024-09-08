import { LockKeyhole } from "lucide-react";
import React, { useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Step, useWallet } from "@/context/wallet-context";

type Props = {};

const Warning = (props: Props) => {
  const { setStep, setAgreed } = useWallet();
  const [isChecked, setIsChecked] = useState(false);

  const handleAgree = () => {
    setAgreed(true);
    setStep(Step.SEED_PHRASE);
  };
  const handleCheckboxChange = (checked: boolean) => {
    setIsChecked(checked);
  };
  return (
    <div className="flex flex-col items-center text-center justify-center w-full px-6 py-5">
      <h1 className="text-3xl lg:text-4xl mb-4 font-bold">
        Recovery Seed Phrase Warning
      </h1>
      <p className="text-center max-w-lg w-full ">
        On the next page, you will receive your secret recovery phrase.
      </p>
      <div className="w-full mt-8 max-w-md mx-auto dark:bg-gray-700 py-6 flex items-center gap-5 px-5 rounded-2xl shadow-md">
        <LockKeyhole className="w-12" />
        <p className="text-start tracking-wide">
          Write it down, store it in a safe place, and NEVER share it with
          anyone.
        </p>
      </div>
      <div className="flex items-start max-w-md mt-5 space-x-2">
        <Checkbox id="terms" onCheckedChange={handleCheckboxChange} />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-5 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I understand that I will be responsible for my secret recovery phrase,
          and this is the only way to recover my wallet.
        </label>
      </div>
      <Button
        onClick={handleAgree}
        disabled={!isChecked}
        className={`text-base w-full mt-8 max-w-md p-6 rounded-xl transition-all duration-300 ease-in bg-gray-900 dark:bg-gray-100 border-2 border-gray-600 text-white dark:text-gray-800 ${
          !isChecked ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Proceed
      </Button>
    </div>
  );
};

export default Warning;
