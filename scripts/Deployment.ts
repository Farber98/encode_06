import { Ballot__factory } from './../typechain-types/factories/Ballot__factory';
import { ethers } from "ethers";
import * as dotenv from 'dotenv';
import { Ballot } from "../typechain-types";
import { TransactionReceipt } from "@ethersproject/providers";
import { configureWallet } from './Utils';
dotenv.config();


async function particularDeployment(signerWallet: ethers.Wallet, contractName:string, proposals:Array<string>): Promise<TransactionReceipt> {
    // Loads the bytecode from contract.
    // Picks contract factory from typechain.
    // Need to pass signer.
    const ballotContractFactory = new Ballot__factory(signerWallet);
      

    console.log(`Deploying ${contractName} contract...`);

    // Uses the default signer to deploy the contract with arguments passed.
    // Returns a contract which is attached to an address
    // The contract will be deployed on that address when the transaction is mined.
    const ballotContract = await ballotContractFactory.deploy(
        // The map() method creates a new array populated with the results of 
        // calling a provided function on every element in the calling array.
        proposals.map(p => ethers.utils.formatBytes32String(p))
    ) as Ballot;
    
    console.log("Waiting for confirmations...")
    
    // Waits that the contract finishes deploying and returns transaction receipt.
    const txReceipt =  await ballotContract.deployTransaction.wait();
    
    return txReceipt
}

function getParticularDeploymentParams(args:Array<string>):{ contractName: string; argument: Array<string>} {
    // Remove first 2 default arguments.
    const proposals = args.slice(2)
    // If no proposals were provided, err out.
    if (proposals.length <= 0) throw new Error("Missing arguments: proposals")
    
    return {contractName: "Ballot", argument: proposals}
}




async function main() {
    // Grab args passed as parameters.
    const args = process.argv
    
    // get wallet configuration for chairperson..
    const signerWallet = configureWallet(process.env.CHAIRPERSON_PRIVATE_KEY)

    // Get contract particular configuration
    // In this case, name of contract and arguments provided parsed.
    const {contractName, argument} = getParticularDeploymentParams(args)

    // Pass particularDeploymentParams to particularDeployment function.
    const txReceipt = await particularDeployment(signerWallet, contractName, argument)

    console.log(`
        Deployer: ${txReceipt.from}
        Tx hash: ${txReceipt.transactionHash}
        Block: ${txReceipt.blockNumber}
        Contract Name: ${contractName}
        Contract Address: ${txReceipt.contractAddress}
        Cost in ETH: ${ethers.utils.formatEther(txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice))}
        Confirmations: ${txReceipt.confirmations}
    `)
}



main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
