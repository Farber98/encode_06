import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { attachToBallot, configureWallet, getCleanArguments } from './Utils';
dotenv.config();



async function main() {
    // Get wallet configuration for voter
    const signerWallet = configureWallet(process.env.DELEGATED_PRIVATE_KEY)

    // Attach ballot contract.
    const ballotContractInstance = await attachToBallot(signerWallet)

    // Get winning Proposal and winner name.
    const action: string = "Winning proposal and winner name"
    console.log(`Fetching information from blockchain...`);
    const winningProposal = await ballotContractInstance.winningProposal()
    const winnerName = await ballotContractInstance.winnerName()

    console.log(`
        Action: ${action}
        From: ${process.env.NO_ROLE_PRIVATE_KEY}
        Winning Proposal: ${winningProposal.add(1)}
        Winner Name: ${ethers.utils.parseBytes32String(winnerName)}
        Tx hash: -
        Block: -
        Contract Address: ${process.env.BALLOT_CONTRACT_ADDRESS}
        Cost in ETH: 0ETH
        Confirmations: -
    `)
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
