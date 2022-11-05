import create from 'zustand'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export const useUserSOLBalanceStore = create((set, _get) => ({
  balance: 0,
 getUserSOLBalance: async (publicKey, connection) => {
    let balance = 0;
    try {
      balance = await connection.getBalance(
        publicKey,
        'confirmed'
      );
      balance = balance / LAMPORTS_PER_SOL;
    } catch (e) {
      console.log(`error getting balance: `, e);
    }
  },
}));

