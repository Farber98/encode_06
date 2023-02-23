import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Ballot } from '../typechain-types';

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

describe("Ballot.sol tests", () => {
    let ballotContract: Ballot;
    
    beforeEach( async () => {
        // Looks in artifacts folder the bytecode for Ballot.sol
        const ballotContractFactory = await ethers.getContractFactory("Ballot");
        
        // Uses the default signer to deploy the contract with arguments passed.
        // Returns a contract which is attached to an address
        // The contract will be deployed on that address when the transaction is mined.
        ballotContract = await ballotContractFactory.deploy(
            // The map() method creates a new array populated with the results of 
            // calling a provided function on every element in the calling array.
            PROPOSALS.map(p => ethers.utils.formatBytes32String(p))
        ) as Ballot;
        
        
        // Waits that the contract finishes deploying.
        await ballotContract.deployed();

    })

    describe("when the contract is deployed", () => {
        it("sets the deployer address as chairperson", async () => {
            const accounts = await ethers.getSigners();
            expect(await ballotContract.chairperson()).to.be.equal(accounts[0].address)
        })

        it("sets the voting weight for the chairperson as 1", async () => {
            const accounts = await ethers.getSigners();
            const chairpersonVoter = await ballotContract.voters(accounts[0].address)
            expect(chairpersonVoter.weight).to.be.equal(1)
        })
        
        it("has the provided proposals", async () => {
            // Proposals is an array that returns a struct with a name.
            // It's impossible to get an entire array from storage at once.
            // We need to search position by position and compare one by one.
            for (let i = 0; i < PROPOSALS.length; i++) {
                const testProposalNameInBytes = ethers.utils.formatBytes32String(PROPOSALS[i])                
                const contractProposal = await ballotContract.proposals(i)
                expect(testProposalNameInBytes).to.be.equal(contractProposal.name)
            }
        })

        it("has zero votes for all proposals", async () => {
            for (let i = 0; i < PROPOSALS.length; i++) {
                const contractProposal = await ballotContract.proposals(i)
                expect(contractProposal.voteCount).to.be.equal(0)
            }
        })

    })

    describe("when the chairperson interacts with the giveRightToVote function in the contract", () =>  {
        it("gives right to vote for another address", async () => {
          // TODO
          throw Error("Not implemented");
        });
        it("can not give right to vote for someone that has voted", async () => {
          // TODO
          throw Error("Not implemented");
        });
        it("can not give right to vote for someone that has already voting rights", async () => {
          // TODO
          throw Error("Not implemented");
        });
      });
    
      describe("when the voter interact with the vote function in the contract", () =>  {
        // TODO
        it("should register the vote", async () => {
          throw Error("Not implemented");
        });
      });
    
      describe("when the voter interact with the delegate function in the contract", () =>  {
        // TODO
        it("should transfer voting power", async () => {
          throw Error("Not implemented");
        });
      });
    
      describe("when the an attacker interact with the giveRightToVote function in the contract", () =>  {
        // TODO
        it("should revert", async () => {
          throw Error("Not implemented");
        });
      });
    
      describe("when the an attacker interact with the vote function in the contract", () =>  {
        // TODO
        it("should revert", async () => {
          throw Error("Not implemented");
        });
      });
    
      describe("when the an attacker interact with the delegate function in the contract", () =>  {
        // TODO
        it("should revert", async () => {
          throw Error("Not implemented");
        });
      });
    
      describe("when someone interact with the winningProposal function before any votes are cast", () => {
        // TODO
        it("should return 0", async () => {
          throw Error("Not implemented");
        });
      });
    
      describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", () =>  {
        // TODO
        it("should return 0", async () => {
          throw Error("Not implemented");
        });
      });
    
      describe("when someone interact with the winnerName function before any votes are cast", () =>  {
        // TODO
        it("should return name of proposal 0", async () => {
          throw Error("Not implemented");
        });
      });
    
      describe("when someone interact with the winnerName function after one vote is cast for the first proposal", () =>  {
        // TODO
        it("should return name of proposal 0", async () => {
          throw Error("Not implemented");
        });
      });
    
      describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", () =>  {
        // TODO
        it("should return the name of the winner proposal", async () => {
          throw Error("Not implemented");
        });
      });
})
