import * as dotenv from 'dotenv';
import { BigNumber, ethers } from 'ethers';
import { attachToBallot, configureWallet, getCleanArguments } from './Utils';
dotenv.config();



async function main() {
    // Get wallet configuration for voter
    const signerWallet = configureWallet(process.env.VOTER_PRIVATE_KEY)

    // Attach ballot contract.
    const ballotContractInstance = await attachToBallot(signerWallet)

    // Get clean args [2:]
    const args = getCleanArguments(process.argv)
    
    // Parse proposalIndex as number
    const proposalIndex: number = Number(args[0])

    // If it's not a number, error.
    if (isNaN(proposalIndex)) {
        throw new Error("Proposal provided was not numeric.")
    }

    const action:string = "Vote"
    console.log(`Executing ${action} transaction`);

    console.log(proposalIndex)
    // Call function to vote. Sub 1 because of indexing in contract.
    const voteTx = await ballotContractInstance.vote(BigNumber.from(proposalIndex - 1))

    console.log(`Waiting for confirmations...`);

    const voteTxReceipt = await voteTx.wait()

    console.log(`
        Action: ${action}
        Voter: ${voteTxReceipt.from}
        Vote: Proposal ${proposalIndex}
        Tx hash: ${voteTxReceipt.transactionHash}
        Block: ${voteTxReceipt.blockNumber}
        Contract Address: ${process.env.BALLOT_CONTRACT_ADDRESS}
        Cost in ETH: ${ethers.utils.formatEther(voteTxReceipt.gasUsed.mul(voteTxReceipt.effectiveGasPrice))}
        Confirmations: ${voteTxReceipt.confirmations}
    `)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
