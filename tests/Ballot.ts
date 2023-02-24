import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Ballot } from '../typechain-types';

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

describe("Ballot.sol tests", () => {
    let ballotContract: Ballot;
    let accounts: SignerWithAddress[]
    
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
      
      // Generalize getting accounts
      accounts = await ethers.getSigners();
    })

    describe("when the contract is deployed", () => {
        it("sets the deployer address as chairperson", async () => {
            expect(await ballotContract.chairperson()).to.be.equal(accounts[0].address)
        })

        it("sets the voting weight for the chairperson as 1", async () => {
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
          
          const giveRightToVoteTx = await ballotContract
            .connect(accounts[0]) 
            .giveRightToVote(accounts[1].address) // Give rights to accounts 1
          
          // Wait that transaction finishes.
          await giveRightToVoteTx.wait();
          
          // Check that new voter has weight of 1.
          const voter = await ballotContract.voters(accounts[1].address)
          expect(voter.weight).to.be.equal(1)
        
        });


        it("can not give right to vote for someone that has already voting rights", async () => {
          // tries to give rights for second time, should revert
          expect(await ballotContract
            .connect(accounts[0]) 
            .giveRightToVote(accounts[1].address)
          ).to.be.reverted 
        });

        it("can not give right to vote for someone that has voted", async () => {
          // gives rights for first time
          const giveRightToVoteTx = await ballotContract
            .connect(accounts[0]) 
            .giveRightToVote(accounts[1].address) 
          
          await giveRightToVoteTx.wait();

          // voter votes proposal 0
          const voteTx = await ballotContract.connect(accounts[1]).vote(0)
          await voteTx.wait();
          
          // tries to give rights for second time, should revert
          // ! the await goes before the expect
          // The logic is: you >await for it to be reverted< and not >expect it to await to be reverted<
          await expect(ballotContract
            .connect(accounts[0]) 
            .giveRightToVote(accounts[1].address)
          ).to.be.revertedWith("The voter already voted.")

        });
      });
    
      describe("when the voter interact with the vote function in the contract", () =>  {
        it("should register the vote", async () => {
          // chairperson gives rights to vote
          const giveRightToVoteTx = await ballotContract
            .connect(accounts[0]) 
            .giveRightToVote(accounts[1].address) 
          
          await giveRightToVoteTx.wait();
          
          // Get proposal before the vote to check after.
          const proposalToBeVoted = 0;
          const proposalBefore = await ballotContract.proposals(proposalToBeVoted)

          // voter votes proposal 0
          const voteTx = await ballotContract.connect(accounts[1]).vote(proposalToBeVoted)
          await voteTx.wait();

          // Check that the vote is registered in voter
          const voter = await ballotContract.voters(accounts[1].address)
          expect(voter.voted).to.be.equal(true)
          expect(voter.vote).to.be.equal(proposalToBeVoted)
          
          const proposalAfter = await ballotContract.proposals(proposalToBeVoted)
          
          // Check that the vote is registered in proposal
          expect(proposalAfter.voteCount).to.be.equal(proposalBefore.voteCount.add(voter.weight))
        });
      });
    
      describe("when the voter interact with the delegate function in the contract", () =>  {
        it("should transfer voting power", async () => {
          // chairperson gives rights to vote to delegator 
          const giveRightToVoteToDelegatorTx = await ballotContract
            .connect(accounts[0]) 
            .giveRightToVote(accounts[1].address) 
          await giveRightToVoteToDelegatorTx.wait();

          // chairperson gives rights to vote to delegated 
          const giveRightToVoteToDelegatedTx = await ballotContract
          .connect(accounts[0]) 
          .giveRightToVote(accounts[2].address) 
        await giveRightToVoteToDelegatedTx.wait();
          
          // Get delegated account before state.
          const delegatedBefore = await ballotContract.voters(accounts[2].address)

          // accounts[1] delegates to accounts[2]
          const delegateVoteTx = await ballotContract
            .connect(accounts[1])
            .delegate(accounts[2].address)
          
            await delegateVoteTx.wait();

          // Check that accounts[1] has voted and delegated.
          const delegator = await ballotContract.voters(accounts[1].address)
          expect(delegator.voted).to.be.equal(true)
          expect(delegator.delegate).to.be.equal(accounts[2].address)

          // Check that delegated gets his weight added.
          const delegatedAfter = await ballotContract.voters(accounts[2].address)
          expect(delegatedAfter.weight).to.be.equal(delegatedBefore.weight.add(delegator.weight))
          
        });
      });
    
      describe("when an attacker interact with the giveRightToVote function in the contract", () =>  {
        it("should revert", async () => {
          await expect(ballotContract
            .connect(accounts[1]) 
            .giveRightToVote(accounts[1].address)
          ).to.be.revertedWith("Only chairperson can give right to vote.")
        });
      });
    
      describe("when the an attacker interact with the vote function in the contract", () =>  {
        it("should revert", async () => {
          await expect(ballotContract
            .connect(accounts[1]) 
            .vote(0)
          ).to.be.revertedWith("Has no right to vote")
        });
      });
    
      describe("when the an attacker interact with the delegate function in the contract", () =>  {
        it("should revert", async () => {
          await expect(ballotContract
            .connect(accounts[1]) 
            .delegate(accounts[2].address)
          ).to.be.revertedWith("You have no right to vote")
        });
      });
    
      describe("when someone interact with the winningProposal function before any votes are cast", () => {
        it("should return 0", async () => {
          expect(await ballotContract.winningProposal()).to.be.equal(0)
        });
      });
    
      describe("when someone interact with the winningProposal function after one vote is cast for the second proposal", () =>  {
        it("should return 1", async () => {
          // gives rights for first time
          const giveRightToVoteTx = await ballotContract
            .connect(accounts[0]) 
            .giveRightToVote(accounts[1].address) 
          
          await giveRightToVoteTx.wait();

          // voter votes proposal 2
          const voteTx = await ballotContract.connect(accounts[1]).vote(1)
          await voteTx.wait();

          expect(await ballotContract.winningProposal()).to.be.equal(1)
        });
      });
    
      describe("when someone interact with the winnerName function before any votes are cast", () =>  {
        it("should return name of proposal 1", async () => {
          expect(await ballotContract.winnerName()).to.be.equal(ethers.utils.formatBytes32String(PROPOSALS[0]))
        });
      });
    
      describe("when someone interact with the winnerName function after one vote is cast for the second proposal", () =>  {
        it("should return name of proposal 2", async () => {
          
          const giveRightToVoteTx = await ballotContract
            .connect(accounts[0]) 
            .giveRightToVote(accounts[1].address) 
          
          await giveRightToVoteTx.wait();

          const voteTx = await ballotContract.connect(accounts[1]).vote(1)
          await voteTx.wait();

          expect(await ballotContract.winnerName()).to.be.equal(ethers.utils.formatBytes32String(PROPOSALS[1]))

        });
      });
    
      describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", () =>  {
        it("should return the name of the winner proposal", async () => {
          // Go through accounts[1] to accounts[6] voting.
          for (let i = 1; i <6; i++) {
            
            const giveRightToVoteTx = await ballotContract
            .connect(accounts[0]) 
            .giveRightToVote(accounts[i].address) 
          
            await giveRightToVoteTx.wait();

          // Get random number putting max and min of interval [0,2].
            let randomVote = Math.floor(Math.random() * (2 - 0 + 1) + 0)
            // Accounts i votes random.
            const voteTx = await ballotContract.connect(accounts[i]).vote(randomVote)
            await voteTx.wait();
          }
          
          // Get winner proposal
          const winnerProposal = await (await ballotContract.winningProposal()).toNumber()
          // Expecte winner name equal to the index given by winner proposal in our proposals array.
          expect(await ballotContract.winnerName()).to.be.equal(ethers.utils.formatBytes32String(PROPOSALS[winnerProposal]))
          
        });
      });
})
