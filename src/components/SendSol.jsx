import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback } from 'react';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';




const SendSol = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const onClick = useCallback(async () => {
      if (!publicKey) {
          console.log('error', `Send Transaction: Wallet not connected!`);
          return;
      }

      // const pubKey = new PublicKey("7BzGMomgbswT6ynUmbkqA2mh2h9oGNgfKwfR2GrEmvRT");
      let signature = '';
      try {
          const destAddress = Keypair.generate().publicKey;
          // anything below this will fail, as this would be below the rent-exemption rate.
          const amount = 1 * LAMPORTS_PER_SOL;

          console.log(amount);

          const transaction = new Transaction().add(
              SystemProgram.transfer({
                  fromPubkey: publicKey,
                  toPubkey: destAddress,
                  lamports: amount,
              })
          );

          signature = await sendTransaction(transaction, connection);

          await connection.TransactionConfirmationConfig(signature, 'confirmed');
          
      } catch (error) {
        
          console.log('error', `Transaction failed! ${error?.message}`, signature);
          return;
      }
  }, [publicKey, connection, sendTransaction]);
  

  return (
    <div>
            <button
                className="group w-60 m-2 btn animate-pulse disabled:animate-none bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ... "
                onClick={onClick} disabled={!publicKey}
            >

                <span className="block group-disabled:hidden" > 
                    Send Transaction 
                </span>
            </button>
        </div>
  )
}

export default SendSol