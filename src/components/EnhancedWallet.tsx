import { useWallet } from "@/context/wallet-context";
import { useToast } from "@/hooks/use-toast";
import { createWallet } from "@/lib/createWallet";
import {
  getAccountInfo,
  getBalance,
  getLatestBlockNumber,
  getTransactionCount,
  sendTransaction,
} from "@/lib/transactionUtils";
import { NetworkType, Wallet } from "@/types/wallet";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

type Props = {};

const EnhancedWallet = (props: Props) => {
  const { wallets, network, setNetwork, setWallets, seedPhrase } = useWallet();
  const [isCreating, setIsCreating] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
  const { toast } = useToast();
  const [networkInfo, setNetworkInfo] = useState<{
    transactionCount: number;
    latestBlock: number;
  } | null>(null);

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        if (wallets.length > 0) {
          const updatedWallets = await Promise.all(
            wallets.map(async (wallet: Wallet) => {
              if (
                wallet.network !== "solana" &&
                wallet.network !== "ethereum"
              ) {
                throw new Error(`Invalid network type: ${wallet.network}`);
              }
              return {
                ...wallet,
                balance: await getBalance(wallet.publicKey, wallet.network),
                accountInfo: await getAccountInfo(
                  wallet.publicKey,
                  wallet.network
                ),
              };
            })
          );
          setWallets(updatedWallets);
        }
        if (network) {
          const txCount = await getTransactionCount(network);
          const latestBlock = await getLatestBlockNumber(network);
          setNetworkInfo({ transactionCount: txCount, latestBlock });
        }
      } catch (error) {
        console.error("Error fetching wallet info:", error);
        toast({
          title: "Error",
          description: "Failed to fetch wallet information. Please try again.",
          variant: "destructive",
        });
      }
    };
    fetchWalletInfo();
  }, [wallets, network, setWallets, toast]);

  const handleCreateWallet = async () => {
    if (!network || !seedPhrase) {
      toast({
        title: "Error",
        description: "Network or Seed Phrase is Missing",
        variant: "destructive",
      });
      return;
    }
    setIsCreating(true);

    try {
      const newWallet = await createWallet(
        network,
        seedPhrase,
        wallets.length,
        walletName ||
          `${network.charAt(0).toUpperCase() + network.slice(1)} Wallet ${
            wallets.length + 1
          }`
      );
      setWallets([...wallets, newWallet]);
      setWalletName("");
      toast({
        title: "Wallet Created",
        description: `New ${network} wallet has been successfully created.`,
      });
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast({
        title: "Error",
        description: "Failed to create new wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSend = async () => {
    if (selectedWallet === null) {
      toast({
        title: "Error",
        description: "Please select a wallet to send from.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const wallet = wallets[selectedWallet];
      const txHash = await sendTransaction(
        wallet.network,
        wallet.privateKey,
        amount,
        recipient
      );
      toast({
        title: "Transaction Sent",
        description: `Sent ${amount} ${
          wallet.network === "solana" ? "SOL" : "ETH"
        } to ${recipient}. Transaction Hash: ${txHash}`,
      });
      // Refresh wallet balance after sending transaction
      const newBalance = await getBalance(wallet.publicKey, wallet.network);
      const updatedWallets = [...wallets];
      updatedWallets[selectedWallet] = { ...wallet, balance: newBalance };
      setWallets(updatedWallets);
    } catch (error) {
      console.error("Error sending transaction:", error);
      toast({
        title: "Error",
        description: "Failed to send transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleNetworkChange = (newNetwork: NetworkType | "") => {
    if (newNetwork === "") {
      // Handle the case where no network is selected, if needed
      setNetwork(null);
      return;
    }
    setNetwork(newNetwork);
    const filteredWallets = wallets.filter(
      (wallet) => wallet.network === newNetwork
    );
    setWallets(filteredWallets);
  };
  return (
    <div className="flex  flex-col items-center justify-center w-full max-w-2xl px-6 py-5">
      <h1 className="text-3xl lg:text-4xl mb-4 font-bold">Your Wallets</h1>

      <Select
        value={network || ""}
        onValueChange={(value: "solana" | "ethereum") =>
          handleNetworkChange(value)
        }
      >
        <SelectTrigger>
          <SelectValue>{network || "Select Network"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="solana">Solana</SelectItem>
          <SelectItem value="ethereum">Ethereum</SelectItem>
        </SelectContent>
      </Select>

      <div className="w-full mb-6">
        {wallets
          .filter((wallet) => wallet.network === network)
          .map((wallet, index) => (
            <div
              key={index}
              className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded"
            >
              <p>
                <strong>Name:</strong> {wallet.name}
              </p>
              <p>
                <strong>Network:</strong> {wallet.network}
              </p>
              <p>
                <strong>Address:</strong> {wallet.publicKey}
              </p>
              <p>
                <strong>Balance:</strong> {wallet.balance}{" "}
                {wallet.network === "solana" ? "SOL" : "ETH"}
              </p>
              {/* {wallet.accountInfo && (
                <p>
                  <strong>Transaction Count:</strong>{" "}
                  {wallet.accountInfo.transactionCount}
                </p>
              )} */}
            </div>
          ))}
      </div>

      <Input
        type="text"
        placeholder="Enter wallet name (optional)"
        value={walletName}
        onChange={(e) => setWalletName(e.target.value)}
        className="mb-4"
      />

      <Button
        onClick={handleCreateWallet}
        disabled={isCreating}
        className="text-base w-full p-6 mb-4 rounded-xl bg-gray-900 dark:bg-gray-100 border-2 border-gray-600 text-white dark:text-gray-800"
      >
        {isCreating ? "Creating..." : "Create New Wallet"}
      </Button>

      <h2 className="text-2xl mb-4 font-bold">Send Transaction</h2>

      <Select
        value={selectedWallet !== null ? selectedWallet.toString() : ""}
        onValueChange={(value) => setSelectedWallet(Number(value))}
        className="mb-4"
      >
        {wallets.map((wallet, index) => (
          <SelectTrigger key={index} value={index.toString()}>
            {wallet.name}
          </SelectTrigger>
        ))}
      </Select>

      <Input
        type="text"
        placeholder="Recipient Address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="mb-4"
      />

      <Input
        type="text"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="mb-4"
      />

      <Button
        onClick={handleSend}
        disabled={isSending || selectedWallet === null}
        className="text-base w-full p-6 rounded-xl bg-gray-900 dark:bg-gray-100 border-2 border-gray-600 text-white dark:text-gray-800"
      >
        {isSending ? "Sending..." : "Send"}
      </Button>
    </div>
  );
};

export default EnhancedWallet;
