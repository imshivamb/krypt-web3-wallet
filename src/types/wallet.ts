export type NetworkType = 'solana' | 'ethereum';

export type Wallet =  {
    privateKey: string,
    publicKey: string,
    network: NetworkType
    name: string,
    balance?: string,
}

export enum Step {
    WELCOME,
    NETWORK_SELECTION,
    WARNING,
    SEED_PHRASE,
    CREATE_WALLET,
  }