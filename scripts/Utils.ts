import { ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dotenv from 'dotenv';
dotenv.config();


// General function to attach to a wallet to ballot and return a ballotContractInstance.
export async function attachToBallot(signerWallet: ethers.Wallet): Promise<Ballot> {
    // Get bytecode.
    const ballotContractFactory = new Ballot__factory(signerWallet);
    let ballotContractInstance: Ballot
    
    // If we have our ballot contract address in .env file, attach it to the instance and return it.
    if (process.env.BALLOT_CONTRACT_ADDRESS !== undefined) {
        ballotContractInstance = await ballotContractFactory.attach(process.env.BALLOT_CONTRACT_ADDRESS)
    } else {
        throw new Error("Missing Ballot contract address from .env")
    }

    return ballotContractInstance
}


export function configureWallet(pkey: string | undefined):ethers.Wallet {
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
    const privateKey = pkey;

    if (!privateKey || privateKey.length <= 0) {
        throw new Error("Missing enviroment: PRIVATE_KEY")
    }

    // Connect to our wallet providing our private key.
    const wallet = new ethers.Wallet(privateKey)

    // return wallet connected to goerli
    return wallet.connect(provider)

}


// General function to get arguments ignoring first 2.
export function getCleanArguments(args:Array<string>): Array<string> {
   // Remove first 2 default arguments.
   
   const cleanArgs = args.slice(2)

   // If no args were provided, err out.
   if (arguments.length <= 0) throw new Error("No arguments provided.")
   
   return cleanArgs
}
