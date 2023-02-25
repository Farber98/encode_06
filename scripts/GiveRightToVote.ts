import { Address } from 'cluster';

import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { attachToBallot, configureWallet, getCleanArguments } from './Utils';
dotenv.config();



async function main() {
    // Get wallet configuration for voter
    const signerWallet = configureWallet(process.env.CHAIRPERSON_PRIVATE_KEY)

    // Attach ballot contract.
    const ballotContractInstance = await attachToBallot(signerWallet)

    // Get clean args [2:]
    const args = getCleanArguments(process.argv)
    
    // Give right to vote to certain address
    const addressToGiveRights: string = args[0]

    // Check if it's a valid address.
    if (!ethers.utils.isAddress(addressToGiveRights)) throw new Error("Provided address is not valid.")

    const action:string = "Give right to vote"
    console.log(`Executing ${action} transaction`);

    // Call function to vote 
    const giveRightsTx = await ballotContractInstance.giveRightToVote(addressToGiveRights)

    console.log(`Waiting for confirmations...`);

    const giveRightsTxReceipt = await giveRightsTx.wait()

    console.log(`
        Action: ${action}
        Gives right to vote: ${giveRightsTxReceipt.from}
        Gains right to vote: ${addressToGiveRights}
        Tx hash: ${giveRightsTxReceipt.transactionHash}
        Block: ${giveRightsTxReceipt.blockNumber}
        Contract Address: ${process.env.BALLOT_CONTRACT_ADDRESS}
        Cost in ETH: ${ethers.utils.formatEther(giveRightsTxReceipt.gasUsed.mul(giveRightsTxReceipt.effectiveGasPrice))}
        Confirmations: ${giveRightsTxReceipt.confirmations}
    `)
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
