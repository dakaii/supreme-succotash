// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TokenLotteryIDL from '../target/idl/token_lottery.json'
import type { TokenLottery } from '../target/types/token_lottery'

// Re-export the generated IDL and type
export { TokenLottery, TokenLotteryIDL }

// The programId is imported from the program IDL.
export const TOKEN_LOTTERY_PROGRAM_ID = new PublicKey(TokenLotteryIDL.address)

// This is a helper function to get the TokenLottery Anchor program.
export function getTokenLotteryProgram(provider: AnchorProvider) {
  return new Program(TokenLotteryIDL as TokenLottery, provider)
}

// This is a helper function to get the program ID for the TokenLottery program depending on the cluster.
export function getTokenLotteryProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the TokenLottery program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return TOKEN_LOTTERY_PROGRAM_ID
  }
}
