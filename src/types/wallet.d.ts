export type Wallet =  {
    privateKey: string,
    publicKey: string,
    network: 'solana' | 'ethereum'
    name: string
}
