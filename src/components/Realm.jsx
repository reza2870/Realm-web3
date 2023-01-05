import{SignerWalletAdapter} from '@solana/wallet-adapter-base'
import React , {useEffect,useCallback} from 'react';
import { useConnection, useWallet} from '@solana/wallet-adapter-react';
import { getRealms,getRealm, getTokenOwnerRecordsByOwner, getVoterWeightRecord, getVoterWeightRecordAddress, getTokenOwnerRecord, getAllTokenOwnerRecords} from '@solana/spl-governance';
//import { BN } from 'bn.js';
import {Connection, PublicKey, Transaction } from '@solana/web3.js';
import {Vote, RpcContext, getTokenOwnerRecordForRealm,getAllProposals} from '@solana/spl-governance';
import { YesNoVote, withCreateTokenOwnerRecord} from '@solana/spl-governance';
import { withCastVote, SYSTEM_PROGRAM_ID, getGovernanceAccount, Proposal, VoteRecord,getGovernanceAccounts,pubkeyFilter,booleanFilter} from '@solana/spl-governance';
import { AnchorProvider} from '@project-serum/anchor'
import { getGovernanceProgramVersion, getProposal , getGovernance, getTokenOwnerRecordAddress, ProgramAccount} from '@solana/spl-governance';
import { NftVoterClient , GatewayClient} from '@solana/governance-program-library';
import { Metadata,deprecated,PROGRAM_ID} from "@metaplex-foundation/mpl-token-metadata";
import {Token} from "@solana/spl-token";
import { getParsedAccountByMint,getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz'
import {
  sendTransactionsV2
} from './sendTransactions'
import{sendTransaction} from './send'
import { BaseSignerWalletAdapter } from '@solana/wallet-adapter-base';
//const {wallet} = RpcContext;



const Realm = ()=> {

 // const connection = new Connection("https://api.devnet.solana.com", 'recent');
    const { connection } = useConnection();
    const { publicKey, signTransaction,signAllTransactions } = useWallet();
    const wallet= useWallet();
   
   // console.log(publicKey)
   useEffect(() => {
    if(publicKey) {
      console.log(publicKey.toBase58());
     
     };

    // eslint-disable-next-line
    }, [publicKey]);
   
   
    const programId = new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw');
    
   

    const realmPk= new PublicKey('4yqmqhbUtsptgWe4T2U3Rrypn64TBsBaQimh8mxgitWn');
    //const governancePk= new PublicKey('HSwTfJLsjne4HFCV5DuWfnzkqch24U93nKPT6A5je9tJ');
    const proposalPk= new PublicKey('4yxjpS5RnZovEsRqjMqEfWe3cGhzpezvcWVB6nDYTd8x');
    const govtokenpk= new PublicKey('HSwTfJLsjne4HFCV5DuWfnzkqch24U93nKPT6A5je9tJ');

    

  const mynftdata = async () =>{

    const nfts= await getParsedNftAccountsByOwner({
      publicAddress: publicKey,
      connection: connection,
    })

    console.log(nfts)

    const getIsFromCollection = (nft) => {
      return (
        nft.data.creators &&
        nft.mint &&
       // (nft.data.creators[0].address==='Gef65Ba4tRgQePePyzw78Mv6yUNUbG9XhKeUH2RrvoPR') &&
       //9GUZ7fvMxNfDpzSuvoWc8rNUhydQh97ce2YiukxGbV3B
        (nft.data.creators.filter(creator => ((creator.address === '7iD3qXZzJJX4SkMMkgun2mgoCzDE7aEgAajagDJTbF3v') 
         // creator.verified &&
         // creator.verified===1
          )).length > 0) &&
      // (nft.collection.verified ||
        //  typeof nft.collection.verified === 'undefined') &&
        //usedCollectionsPks.includes(nft.collection.mintAddress) &&
        nft.data.creators?.filter((x) => x.verified).length > 0
      )
    }
    
    const votingNfts = nfts.filter(nft => getIsFromCollection(nft))

    /*const data = Object.keys(votingNfts).map((key) => votingNfts[key])
    const metadataAccounts = await Promise.all(
      data.map((x) => deprecated.Metadata.getPDA(x.mint))
    )*/

    console.log(votingNfts)


  } 

   const castvote = useCallback( async ()=> { 
         

          let instructions = [];
          let signers = [];
          const realm = await getRealm(connection, realmPk);
          console.log(realm);
          const programVersion = await getGovernanceProgramVersion(
            connection,
            programId,
          );
          console.log(programVersion)
          const proposalf = await getGovernanceAccount<Proposal>(
              connection,
            proposalPk,
            Proposal
           )
          console.log(proposalf)
          const vote = Vote.fromYesNoVote(YesNoVote.Yes);
          console.log(vote)
          const proposal= await getProposal(connection,proposalPk)
          console.log(proposal)
          
          const communitymintpk = await getRealm(connection, realmPk).then(res => {return res.account.communityMint})
          console.log(communitymintpk.toBase58())
          const tokenOwnerRecordPk= await getProposal(connection,proposalPk).then(res => {return res.account.tokenOwnerRecord})
          const governancePk = await getProposal(connection,proposalPk).then(res => {return res.account.governance})
          const governancetokenmint= await getProposal(connection,proposalPk).then(res => {return res.account.governingTokenMint})
          const governancetokenowner= await getProposal(connection,proposalPk).then(res => {return res.owner})
          const governance = await getGovernance (connection,governancePk)
          const tokOwnerRecord = await getTokenOwnerRecordAddress(programId,realmPk,communitymintpk,publicKey)
          console.log(tokOwnerRecord)
          console.log(governance)
          console.log(governancetokenmint.toBase58())
          console.log(governancePk.toBase58())
          console.log(tokenOwnerRecordPk.toBase58())
          console.log(governancetokenowner.toBase58())
         // console.log(new PublicKey( governancePk))
          console.log(vote)




          const allproposals = await getAllProposals(connection,programId,realmPk)
          console.log("all proposals:")
          console.log(allproposals)
          const yesvotes= proposal.account.getYesVoteCount()
          console.log(yesvotes)
         

          /*
          export declare enum ProposalState {
            Draft = 0,
            SigningOff = 1,
            Voting = 2,
            Succeeded = 3,
            Executing = 4,
            Completed = 5,
            Cancelled = 6,
            Defeated = 7,
            ExecutingWithErrors = 8
        }
        */
          
          const yy= await proposal.account.getStateTimestamp()
          console.log(yy)
          const gg= proposal.account.state
          console.log(gg)
          

         

          const uu= proposal.account.hasVoteTimeEnded(governance.account)
          console.log(uu)

           ///How much time remaines untill vote ended
           const kk= proposal.account.getTimeToVoteEnd(governance.account)
           console.log(kk)

           const cc= proposal.account.tokenOwnerRecord
           //const qq= proposal.account.
          console.log(cc)


          function arrayToRecord(
            source,
            getKey
          ) {
            return source.reduce((all, a) => ({ ...all, [getKey(a)]: a }), {}) 
          }


         //which proposals, wallet voted?
          async function getVoteRecordsByVoterMapByProposal(
            connection,
            programId,
            voter
          ) {
            return getGovernanceAccounts(connection, programId, VoteRecord, [
              pubkeyFilter(33, voter),
            ]).then((vrs) => arrayToRecord(vrs, (vr) => vr.account.proposal.toBase58()))
          }
  
      
         const rzr= await getVoteRecordsByVoterMapByProposal(connection,programId,publicKey)
         console.log(rzr)



        // which voters voted the proposal?
         async function getVoteRecordsByProposalMapByVoter(
          connection,
          programId,
          proposalPubKey
        ) {
          return getGovernanceAccounts(connection, programId, VoteRecord, [
            pubkeyFilter(1, proposalPubKey),
          ]).then((vrs) =>
            arrayToRecord(vrs, (vr) => vr.account.governingTokenOwner.toBase58())
          )
        }

        const raar= await getVoteRecordsByProposalMapByVoter(connection,programId,proposalPk)
        console.log(raar)







        //which nft does wallet have?
        const nfts= await getParsedNftAccountsByOwner({
          publicAddress: publicKey,
          connection: connection,
        })

        console.log(nfts)

        const getNftVoteRecordProgramAddress = async (
          proposalPk,
          nftMintAddress,
          clientProgramId
        ) => {
          const [nftVoteRecord, nftVoteRecordBump] = await PublicKey.findProgramAddress(
            [
              Buffer.from('nft-vote-record'),
              proposalPk.toBuffer(),
              new PublicKey(nftMintAddress).toBuffer(),
            ],
            clientProgramId
          )
        
          return {
            nftVoteRecord,
            nftVoteRecordBump,
          }
        }

     

        const getIsFromCollection = (nft) => {
          return (
            nft.data.creators &&
            nft.mint &&
           // (nft.data.creators[0].address==='Gef65Ba4tRgQePePyzw78Mv6yUNUbG9XhKeUH2RrvoPR') &&
            (nft.data.creators.filter(creator => ((creator.address === '7iD3qXZzJJX4SkMMkgun2mgoCzDE7aEgAajagDJTbF3v') 
             // creator.verified &&
             // creator.verified===1
              )).length > 0) &&
          // (nft.collection.verified ||
            //  typeof nft.collection.verified === 'undefined') &&
            //usedCollectionsPks.includes(nft.collection.mintAddress) &&
            nft.data.creators?.filter((x) => x.verified).length > 0
          )
        }
        
        const votingNfts = nfts.filter(nft => getIsFromCollection(nft))

        /*const data = Object.keys(votingNfts).map((key) => votingNfts[key])
        const metadataAccounts = await Promise.all(
          data.map((x) => deprecated.Metadata.getPDA(x.mint))
        )*/

        console.log(votingNfts)
        const ASSOCIATED_TOKEN_PROGRAM_ID= new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
        const TOKEN_PROGRAM_ID= new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

        const getAssociatedTokenAccount= async (nft) => {
          const ata = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
            TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
            new PublicKey(nft.mint), // mint
            publicKey, // owner
            true
          )
          console.log(ASSOCIATED_TOKEN_PROGRAM_ID);
          console.log(TOKEN_PROGRAM_ID)
          console.log(new PublicKey(nft.mint))
         // console.log(ownerPk)
          console.log(ata.toBase58())

          return ata.toBase58()
        }

        const nftptogramid= new PublicKey('GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw');
        class AccountData {
          pubkey
          isSigner
          isWritable
          constructor(
            pubkey,
            isSigner = false,
            isWritable = false
          ) {
            this.pubkey = typeof pubkey === 'string' ? new PublicKey(pubkey) : pubkey
            this.isSigner = isSigner
            this.isWritable = isWritable
          }
        }

        const remainingAccounts= []

        
        
    for (let i = 0; i < votingNfts.length; i++) {
        const nft = votingNfts[i] 
        const tokenAccount = await getAssociatedTokenAccount(nft)
        console.log(tokenAccount)
        const {nftVoteRecord} = await getNftVoteRecordProgramAddress(
          proposalPk,
          nft.mint,
          nftptogramid
        )
        console.log(nftVoteRecord)

       // const nftaddress = await Metadata.getPDA(nft.mint);
       let [nftaddress, bump] = await PublicKey.findProgramAddress([
        Buffer.from("metadata"),
        PROGRAM_ID.toBuffer(),
        new PublicKey(nft.mint).toBuffer(),
        ], PROGRAM_ID)

        remainingAccounts.push(
          new AccountData(tokenAccount),
          new AccountData(nftaddress),
          new AccountData(nftVoteRecord, false, true)
        )
 
        console.log(tokenAccount)
        console.log(nftaddress)
        console.log(nftVoteRecord)
        console.log(remainingAccounts)
        //console.log(nft.mintAddress)
        //console.log(clientProgramId)
        // console.log(nft)
   }
      

        async function chunks (array, size) {
          const result = []
          let i, j
          for (i = 0, j = array.length; i < j; i += size) {
            result.push(array.slice(i, i + size))
          }
          return result
        }

          
        const firstFiveNfts = remainingAccounts.slice(0, 15)
        console.log(firstFiveNfts)
        const remainingNftsToChunk = remainingAccounts.slice(
          15,
          remainingAccounts.length
        )
      console.log(remainingNftsToChunk)
        const nftsChunk = await chunks(remainingNftsToChunk, 12)
        console.log(nftsChunk)

        const getNftVoterWeightRecord = async (
          realmPk,
          governancetokenmint,
          publicKey,
          programId
        ) => {
          const [
            voterWeightPk,
            voterWeightRecordBump,
          ] = await PublicKey.findProgramAddress(
            [
              Buffer.from('voter-weight-record'),
              realmPk.toBuffer(),
              governancetokenmint.toBuffer(),
              publicKey.toBuffer(),
            ],
            programId
          )
          return {
            voterWeightPk
          }
        }
        
        const voterweightrecordf= await getNftVoterWeightRecord(realmPk,
          communitymintpk,
          publicKey,
          nftptogramid).then(res=>{return res.voterWeightPk});;


          const getNftRegistrarPDA = async (
            realmPk,
            mint,
            clientProgramId
          ) => {
            const [registrar, registrarBump] = await PublicKey.findProgramAddress(
              [Buffer.from('registrar'), realmPk.toBuffer(), mint.toBuffer()],
              clientProgramId
            )
            return {
              registrar,
              registrarBump,
            }
          }
  
         const {registrar}  = await getNftRegistrarPDA(
            realmPk,
            communitymintpk,
            nftptogramid
          )

       
        
        const options = AnchorProvider.defaultOptions()
        const provider = new AnchorProvider(
          connection,
          publicKey,
          options
        )
       // const client = new NftVoterClient();
       const client=await NftVoterClient.connect(
          provider,
          true
        );
        console.log(client)
        console.log(instructions)

        const client2 = await GatewayClient.connect(provider,true)
       
        for (const i of nftsChunk) {
          console.log(instructions)

       const castNftVoteIx = await client.program.methods
            .castNftVote(proposalPk)
            .accounts({
              registrar,
              voterWeightRecord: voterweightrecordf,
              governingTokenOwner: publicKey,
              payer: publicKey,
              systemProgram: SYSTEM_PROGRAM_ID,
            })
            .remainingAccounts(i)
            .instruction()
  
          instructions.push(castNftVoteIx)
        }
        // console.log(castNftVoteIx)
         console.log(instructions)   
         console.log()
         const getNftMaxVoterWeightRecord = async (
          realmPk,
          governancetokenmint,
          programId
        ) => {
          const [
            maxVoterWeightRecord,
            maxVoterWeightRecordBump,
          ] = await PublicKey.findProgramAddress(
            [
              Buffer.from('max-voter-weight-record'),
              realmPk.toBuffer(),
              governancetokenmint.toBuffer(),
            ],
            programId
          )
          return {
            maxVoterWeightRecord
          }
        }
        

        const voterweightmaxf = await getNftMaxVoterWeightRecord(realmPk,
          communitymintpk,
          nftptogramid).then(res=>{return res.maxVoterWeightRecord});


         
         const castNftVoteIx2 = await client.program.methods
        .castNftVote(proposalPk)
        .accounts({
          registrar,
          voterWeightRecord: voterweightrecordf,
          governingTokenOwner: publicKey,
          payer: publicKey,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .remainingAccounts(firstFiveNfts)
        .instruction()
      instructions.push(castNftVoteIx2)


      console.log(castNftVoteIx2)
      console.log(instructions)
       


          

          
          console.log(voterweightrecordf);
          console.log(voterweightmaxf);
          
         

        
          
            await withCastVote(
            instructions,
            programId,
            2,
            realmPk,
            governancePk,
            proposalPk,
            tokenOwnerRecordPk, // Proposal owner TokenOwnerRecord
            tokOwnerRecord,
           // tokOwnerRecord, // Voter TokenOwnerRecord
            publicKey,
            governancetokenmint,
            vote,
            publicKey,
           voterweightrecordf,
           voterweightmaxf
           )
           
           console.log(instructions)
         
          
            const Sequential= 0;
            const Parallel=1;
            const StopOnFailure=2;
          



          let message=[];

           const instructionsCountThatMustHaveTheirOwnChunk = message ? 4 : 2
           console.log(instructionsCountThatMustHaveTheirOwnChunk)
           const instructionsWithTheirOwnChunk = instructions.slice(
            -instructionsCountThatMustHaveTheirOwnChunk
          )
          console.log(instructionsWithTheirOwnChunk)
          const remainingInstructionsToChunk = instructions.slice(
            0,
            instructions.length - instructionsCountThatMustHaveTheirOwnChunk
          )
          const splInstructionsWithAccountsChunk = await chunks(
            instructionsWithTheirOwnChunk,
            2
          )
          console.log(splInstructionsWithAccountsChunk)
          const nftsAccountsChunks = await chunks(remainingInstructionsToChunk, 2)
          console.log(nftsAccountsChunks)
          const signerChunks = Array(
            splInstructionsWithAccountsChunk.length + nftsAccountsChunks.length
          ).fill([])

          const transactionInstructionsToTypedInstructionsSets = (
            instructionsSet,
            type
          ) => {
            return {
              instructionsSet,
              type
            }
          }

          const singersMap = message
          ? [...signerChunks.slice(0, signerChunks.length - 1), signers]: signerChunks

        const instructionsChunks = [
          ...nftsAccountsChunks.map((x) =>
            transactionInstructionsToTypedInstructionsSets(x, Parallel)
          ),
          ...splInstructionsWithAccountsChunk.map((x) =>
            transactionInstructionsToTypedInstructionsSets(
              x,
              Sequential
            )
          ),
        ]
        console.log(instructionsChunks)
        let walletf= publicKey;


        const unsignedTxns= []
        

        const SequenceType= {
          Sequential,
          Parallel, 
          StopOnFailure
        }
        
        const DEFAULT_TIMEOUT = 60000
        const getUnixTs = () => {
          return new Date().getTime() / 1000
        }

    /*    const tokenRecords = await getTokenOwnerRecordsByOwner(connection,programId,publicKey)
        const ownTokenRecord = publicKey
       ? tokenRecords[publicKey.toBase58()]
        : null
        console.log(tokenRecords)*/

        //for checking the register: 1. check user have Nft? 2. have registered?
       const aa_checkmain= await getAllTokenOwnerRecords(connection,programId,realmPk)
       console.log(aa_checkmain) 
     //  const checkregister1= await getTokenOwnerRecordAddress(nftptogramid,realmPk,communitymintpk,publicKey)
     // console.log(checkregister1)
       //const checkregister= await getTokenOwnerRecordForRealm(connection,programId,realmPk,governancetokenmint ,publicKey)
      //  console.log(checkregister)
      
        const handleRegister = async () => {
          const instructionsr = []
          const { voterWeightPk } = await getNftVoterWeightRecord(
            realmPk,
            governancetokenmint,
            publicKey,
            nftptogramid
          )
          const { registrar } = await getNftRegistrarPDA(
            realmPk,
            communitymintpk,
            nftptogramid
          )
          // If a vote weight record is needed (i.e. the realm has a voter weight plugin)
          // but doesn't exist yet, add the instruction to create it to the list
       
            const createVoterWeightRecordIx = await client.program.methods
              .createVoterWeightRecord(publicKey)
              .accounts({
                voterWeightRecord: voterWeightPk,
                governanceProgramId:programId,
                realm: realmPk,
                realmGoverningTokenMint:communitymintpk,
                payer:publicKey,
                systemProgram: SYSTEM_PROGRAM_ID,
              })
              .instruction()
             
            
            console.log(createVoterWeightRecordIx)
            instructionsr.push(createVoterWeightRecordIx)
            //instructionsr[0].programId=new PublicKey('GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw');
            //instructionsr[1].programId=programId;
            console.log(instructionsr)
          // If a token owner record doesn't exist yet,
          // add the instruction to create it to the list
         
            await withCreateTokenOwnerRecord(
              instructionsr,
              programId,
              3,
              realmPk,
              publicKey,
              governancetokenmint,
              publicKey
            )
          
          const transaction = new Transaction()
          transaction.add(...instructionsr)

        //  await sendTransaction(transaction,connection)
      
          await sendTransaction({
            transaction:transaction,
            wallet:wallet,
            connection:connection,
            signers: [],
            sendingMessage: `Registering`,
            successMessage: `Registered`,
          })
         // await fetchRealm(realm?.owner, realm?.pubkey)
        }

     // handleRegister();
        
      await sendTransactionsV2({
          connection,
          wallet,
          TransactionInstructions: instructionsChunks,
          signersSet: singersMap,
          showUiComponent: false,
          runAfterApproval: false,
          runAfterTransactionConfirmation:false ,
        })
      
    },[publicKey, connection, , sendTransaction])


   return (
    <div>
            <button
                className="group w-60 m-2 btn animate-pulse disabled:animate-none bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ... "
                onClick={castvote} disabled={!publicKey}
            >
                <span className="block group-disabled:hidden" > 
                    VOTE 
                </span>
            </button>
            <button
                className="group w-60 m-2 btn animate-pulse disabled:animate-none bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ... "
                onClick={mynftdata} disabled={!publicKey}
            >
                <span className="block group-disabled:hidden" > 
                    Mynfts 
                </span>
            </button>
          
            
        </div>
  )
}
 export default  Realm