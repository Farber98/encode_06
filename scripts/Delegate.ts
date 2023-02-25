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
    
    // Check if provided address is valid.
    const addressToDelegate: string = args[0]
    if (!ethers.utils.isAddress(addressToDelegate)) throw new Error("Provided address is not valid.")

    const action:string = "Delegate"
    
    console.log(`Executing ${action} transaction`);

    // Give right to vote to provided address
    const delegateTx = await ballotContractInstance.delegate(addressToDelegate)

    console.log(`Waiting for confirmations...`);

    const delegateTxReceipt = await delegateTx.wait()

    console.log(`
        Action: ${action}
        Voter: ${delegateTxReceipt.from}
        Delegates: ${addressToDelegate}
        Tx hash: ${delegateTxReceipt.transactionHash}
        Block: ${delegateTxReceipt.blockNumber}
        Contract Address: ${process.env.BALLOT_CONTRACT_ADDRESS}
        Cost in ETH: ${ethers.utils.formatEther(delegateTxReceipt.gasUsed.mul(delegateTxReceipt.effectiveGasPrice))}
        Confirmations: ${delegateTxReceipt.confirmations}
    `)
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
