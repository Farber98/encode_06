import { Ballot__factory } from './../typechain-types/factories/Ballot__factory';
import { ethers } from "ethers";
import * as dotenv from 'dotenv';
import { Ballot } from "../typechain-types";
import { TransactionReceipt } from "@ethersproject/providers";
dotenv.config();


async function particularDeployment(signerWallet: ethers.Wallet, contractName:string, proposals:Array<string>): Promise<TransactionReceipt> {
    // Loads the bytecode from contract.
    // Picks contract factory from typechain.
    // Need to pass signer.
    const BallotcontractFactory = new Ballot__factory(signerWallet);
      

    console.log(`Deploying ${contractName} contract...`);

    // Uses the default signer to deploy the contract with arguments passed.
    // Returns a contract which is attached to an address
    // The contract will be deployed on that address when the transaction is mined.
    const ballotContract = await BallotcontractFactory.deploy(
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

function configureWallet():ethers.Wallet {
    // Configure provider as goerli

    const provider = ethers.providers.getDefaultProvider("goerli", {
        // Provide personal keys from enviroment.
        alchemy: process.env.ALCHEMY_API_KEY,
        etherscan: process.env.ETHERSCAN_API_KEY,
        infura: {
            projectId: process.env.INFURA_API_KEY,
            projectSecret: process.env.INFURA_API_SECRET, 
        }
    }) 

    //const provider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY_API_KEY)


    // Get our private key from enviroment
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey || privateKey.length <= 0) {
        throw new Error("Missing enviroment: PRIVATE_KEY")
    }

    // Connect to our wallet providing our private key.
    const wallet = new ethers.Wallet(privateKey)

    // return wallet connected to goerli
    return wallet.connect(provider)

}


async function main() {
    // Grab args passed as parameters.
    const args = process.argv
    
    // Configure and get signerWallet.
    const signerWallet = configureWallet()

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
