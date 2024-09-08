import { Wallet } from "@/types/wallet";
import { mnemonicToSeed } from 'bip39';
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import { Wallet as EthWallet, HDNodeWallet } from "ethers";

export async function createWallet(
    network: 'solana' | 'ethereum',
    seedPhrase: string,
    index: number,
    name?: string
  ): Promise<Wallet> {
    if(network === 'solana') {
        const seed = await mnemonicToSeed(seedPhrase);
        const path = `m/44'/501'/${index}'/0'`;
        const derivedSeed = derivePath(path, seed.toString("hex")).key;
        const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
        const keyPair = Keypair.fromSecretKey(secret);
        return {
            name: name || `Wallet ${index + 1}`,
            publicKey: keyPair.publicKey.toBase58(),
            privateKey: Buffer.from(keyPair.secretKey).toString('hex'),
            network: 'solana'
        }
    } else if(network === 'ethereum') {
        const seed = await mnemonicToSeed(seedPhrase);
        const hdNode = HDNodeWallet.fromSeed(seed);
        const wallet = hdNode.derivePath(`m/44'/60'/0'/0/${index}`);
        return {
            name: name || `Ethereum Wallet ${index + 1}`,
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey,
            network: 'ethereum'
        }
    } else {
        throw new Error(`Unsupported network: ${network}`);
    }
}  