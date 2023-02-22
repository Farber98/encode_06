import { expect } from "chai";
import { Address } from "cluster";
import { ethers } from "hardhat"; // Getting ethers from hardhat 
import { HelloWorld } from "../typechain-types";


describe("HelloWorld.sol tests", function () {
    let helloWorldContract: HelloWorld;

    // Define beforeEach hook to deploy a new instance of the contract before each subtest.

    this.beforeEach(async function() {
        // Looks in artifacts folder the bytecode for HelloWorld.sol
        const helloWorldFactory = await ethers.getContractFactory("HelloWorld")
        // Uses the default signer to deploy the contract with arguments passed.
        // Returns a contract which is attached to an address
        // The contract will be deployed on that address when the transaction si mined.
        helloWorldContract = await helloWorldFactory.deploy() as HelloWorld;
        // Waits that the contract finishes deploying.
        await helloWorldContract.deployed();
    })


    it("Should give a Hello World", async function () {
        // Getting value of read only method without tx.
        const helloWorldText = await helloWorldContract.helloWorld();
        // Using chai to assert the value we are expecting.
        expect(helloWorldText).to.equal("Hello World");       
    })

    it("Should set owner to deployer account", async function() {
        // Get all hardhat accounts
        const accounts = await ethers.getSigners();
        // Get contract owner.
        const contractOwner = await helloWorldContract.owner();
        // Assert that the contract owner is the first signer.
        // This is default behaviour:
        // - Unless specified, deployer will be getSigners()[0].address by default.
        expect(contractOwner).to.equal(accounts[0].address);
    })

    it("Should not allow anyone other than owner to call transferOwnership", async function () {
        const accounts = await ethers.getSigners();
        await expect(
            helloWorldContract
                .connect(accounts[1]) // Make the call connected as accounts[1]
                .transferOwnership(accounts[1].address) 
        ).to.be.revertedWith("Caller is not the owner") // Expect to be reverted with custom msg.
    })
    
    it("Should execute transferOwnership correctly", async function () {
        const accounts = await ethers.getSigners();
        const transferOwnershipTx = await helloWorldContract
            .connect(accounts[0]) // Make the call connected as accounts[0], owner by default.
            .transferOwnership(accounts[1].address)
        // Wait that transaction finishes.
        await transferOwnershipTx.wait();
        // Check that owner is the new owner.
        expect(await helloWorldContract.owner()).to.be.equal(accounts[1].address)
      });
    
      it("Should not allow anyone other than owner to change text", async function () {
        const accounts = await ethers.getSigners();
        await expect(helloWorldContract
            .connect(accounts[1])    
            .setText("Bye, universe!")
        ).to.be.revertedWith("Caller is not the owner");
      });
    
      it("Should change text correctly", async function () {
        const newText = "Bye, universe!"
        const accounts = await ethers.getSigners();
        const setTextTx = await helloWorldContract
            .connect(accounts[0])    
            .setText(newText)
        await setTextTx.wait();
        expect(await helloWorldContract.helloWorld()).to.be.equal(newText)
      });
});
