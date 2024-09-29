import { useWallet } from "@/context/wallet-context";
import { useToast } from "@/hooks/use-toast";
import { createWallet } from "@/lib/createWallet";
import { useRouter } from "next/navigation";
import {
  getAccountInfo,
  getBalance,
  getLatestBlockNumber,
  getTransactionCount,
  sendTransaction,
} from "@/lib/transactionUtils";
import { Step } from "@/types/wallet";
import { NetworkType, Wallet } from "@/types/wallet";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Props = {};

const EnhancedWallet = (props: Props) => {
  const { wallets, network, setNetwork, setWallets, seedPhrase, setStep } =
    useWallet();
  const [isCreating, setIsCreating] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const [networkInfo, setNetworkInfo] = useState<{
    transactionCount: number;
    latestBlock: number;
  } | null>(null);
  const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<{
    [key: string]: boolean;
  }>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

  useEffect(() => {
    // Loading stored wallets on component mount
    const storedWallets = localStorage.getItem("wallets");
    if (storedWallets) {
      setWallets(JSON.parse(storedWallets));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wallets", JSON.stringify(wallets));
  }, [wallets]);

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
        // if (network) {
        //   const txCount = await getTransactionCount(network);
        //   const latestBlock = await getLatestBlockNumber(network);
        //   setNetworkInfo({ transactionCount: txCount, latestBlock });
        // }
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
  }, [network, setWallets]);

  const togglePrivateKeyVisibility = (publicKey: string) => {
    setVisiblePrivateKeys((prev) => ({
      ...prev,
      [publicKey]: !prev[publicKey],
    }));
  };

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
      // Fetch the balance for the new wallet
      const balance = await getBalance(newWallet.publicKey, newWallet.network);
      const walletWithBalance = { ...newWallet, balance };
      setWallets([...wallets, walletWithBalance]);
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
      console.log(newBalance);
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
      setNetwork(null);
      return;
    }
    setNetwork(newNetwork);
  };

  const handleDeleteWallet = (walletIndex: number) => {
    const updatedWallets = wallets.filter((_, index) => index !== walletIndex);
    const deletedWallet = wallets[walletIndex];

    if (updatedWallets.length === 0) {
      setStep(Step.WELCOME);
      setNetwork(null);
    } else if (
      !updatedWallets.some((wallet) => wallet.network === deletedWallet.network)
    ) {
      setNetwork(null);
    }

    if (selectedWallet !== null) {
      if (selectedWallet === walletIndex) {
        setSelectedWallet(null);
      } else if (selectedWallet > walletIndex) {
        setSelectedWallet(selectedWallet - 1);
      }
    }

    setWallets(updatedWallets);
    setWalletToDelete(null);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Wallet Deleted",
      description: "The selected wallet has been deleted.",
    });
  };
  return (
    <div className="flex  flex-col items-center justify-center w-full max-w-screen-xl px-6 py-5">
      <h1 className="text-3xl lg:text-4xl mb-4 font-bold">Your Wallets</h1>

      <div className="mb-5 flex items-center justify-end w-full gap-6">
        <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
          <DialogTrigger asChild className="w-56">
            <Button className="text-sm w-48 p-[18px]  rounded-xl bg-gray-900 dark:bg-gray-100 border-2 border-gray-600 text-white dark:text-gray-800">
              Send Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Transaction</DialogTitle>
            </DialogHeader>
            <Select
              value={selectedWallet !== null ? selectedWallet.toString() : ""}
              onValueChange={(value) => setSelectedWallet(Number(value))}
            >
              <SelectTrigger className="mt-5">
                <SelectValue placeholder="Select Wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className=""
            />
            <Input
              type="text"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className=""
            />
            <Button
              onClick={handleSend}
              disabled={
                isSending ||
                selectedWallet === null ||
                amount === "" ||
                recipient === ""
              }
              className="text-base w-full p-5 rounded-lg bg-gray-900 dark:bg-gray-100 border-2 border-gray-600 text-white dark:text-gray-800"
            >
              {isSending ? "Sending..." : "Send"}
            </Button>
          </DialogContent>
        </Dialog>
        <Input
          type="text"
          placeholder="Enter wallet name (optional)"
          value={walletName}
          onChange={(e) => setWalletName(e.target.value)}
          className=" w-56"
        />

        <Button
          onClick={handleCreateWallet}
          disabled={isCreating}
          className="text-sm w-36 p-[18px] rounded-xl bg-gray-900 dark:bg-gray-100 border-2 border-gray-600 text-white dark:text-gray-800"
        >
          {isCreating ? "Creating..." : " New Wallet"}
        </Button>
        <Select
          value={network || ""}
          onValueChange={(value: "solana" | "ethereum") =>
            handleNetworkChange(value)
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue>{network || "Select Network"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solana">Solana</SelectItem>
            <SelectItem value="ethereum">Ethereum</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
                <strong>Private Key:</strong>
                {visiblePrivateKeys[wallet.publicKey]
                  ? wallet.privateKey
                  : "••••••••••••••••"}
                <button
                  onClick={() => togglePrivateKeyVisibility(wallet.publicKey)}
                  className="ml-2"
                >
                  {visiblePrivateKeys[wallet.publicKey] ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </p>
              <div className="flex justify-between items-center mt-2">
                <p>
                  <strong>Balance:</strong> {wallet.balance}{" "}
                  {wallet.network === "solana" ? "SOL" : "ETH"}
                </p>
                <Dialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setWalletToDelete(index);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 size={16} className="" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Are you sure you want to delete this wallet?
                      </DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete your wallet and remove the data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (walletToDelete !== null) {
                            handleDeleteWallet(walletToDelete);
                          }
                        }}
                      >
                        Delete Wallet
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              {/* {wallet.accountInfo && (
                <p>
                  <strong>Transaction Count:</strong>{" "}
                  {wallet.accountInfo.transactionCount}
                </p>
              )} */}
            </div>
          ))}
      </div>
    </div>
  );
};

export default EnhancedWallet;
