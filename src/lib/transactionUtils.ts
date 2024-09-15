import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import { ethers } from "ethers";

const SOLANA_RPC_URL = 'https://api.devnet.solana.com';
const ETH_RPC_URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

async function sendJsonRpcRequest(url: string, method: string, params: any[]) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            method,
            params,
            id: 1,
            jsonrpc: '2.0',
        }),
    });
    const data = await response.json();
    if(data.error) {
        throw new Error(`RPC Error: ${data.error.message}`);
    }
    return data;
}

export async function getBalance(address: string, network: 'solana' | 'ethereum'): Promise<string> {
    try {
        if(network === 'solana') {
            const result = await sendJsonRpcRequest(SOLANA_RPC_URL, 'getBalance', [address]);
            return (result.result.value /1e9).toFixed(4);
        } else {
            const result = await sendJsonRpcRequest(ETH_RPC_URL, 'eth_getBalance', [address, 'latest']);
            return ethers.formatEther(result.result);
        }
    } catch (error) {
        console.error('Error fetching balance:', error);
        throw error;
    }
}

export async function getAccountInfo(address: string, network: 'solana' | 'ethereum'): Promise<any> {
    try {
        if(network === 'solana') {
            const result = await sendJsonRpcRequest(SOLANA_RPC_URL, 'getAccountInfo', [address]);
            return result.result;
        } else {
            const result = await sendJsonRpcRequest(ETH_RPC_URL, 'eth_getTransactionCount', [address, 'latest']);
            return { transactionCount: parseInt(result.result, 16) };
        }
    } catch (error) {
        console.error('Error fetching acconut info:', error);
        throw error;
    }
}

export async function getTransactionCount( network: 'solana' | 'ethereum'): Promise<number> {
    try {
        if(network === 'solana') {
            const result = await sendJsonRpcRequest(SOLANA_RPC_URL, 'getTranasactionCount', []);
            return result.result;
        } else {
            const result = await sendJsonRpcRequest(ETH_RPC_URL, 'eth_blockNumber', []);
            return parseInt(result.result, 16);
        }
    } catch (error) {
        console.error('Error fetching transaction count:', error);
        throw error;
    }
}

export async function getLatestBlockNumber( network: 'solana' | 'ethereum'): Promise<number> {
    try {
        if(network === 'solana') {
            const connection = new Connection(SOLANA_RPC_URL);
            return await connection.getSlot();
        } else {
            const result = await sendJsonRpcRequest(ETH_RPC_URL, 'eth_blockNumber', []);
            return parseInt(result.result, 16);
        }
    } catch (error) {
        console.error('Error fetching latest block number:', error);
        throw error;
    }
}

export async function sendTransaction( network: 'solana' | 'ethereum', privateKey: string, recipient: string, amount: string): Promise<string> {
    try {
        if(network === 'solana') {
            const connection = new Connection(SOLANA_RPC_URL);
            const senderKeyPair = Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));
            const recipientPubKey = new PublicKey(recipient);

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: senderKeyPair.publicKey,
                    toPubkey: recipientPubKey,
                    lamports: Number(parseFloat(amount) * 1e9)
                })
            )
            const signature = await sendAndConfirmTransaction( connection, transaction, [senderKeyPair] );
            return signature;
        } else {
            const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
            const wallet = new ethers.Wallet(privateKey, provider);
            const tx = await wallet.sendTransaction({
                to: recipient,
                value:ethers.parseEther(amount),

            });
            await tx.wait();
            return tx.hash;
        }
    } catch (error) {
        console.error('Error sending transaction:', error);
        throw error;
    }
}