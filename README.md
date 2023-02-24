# Hello, voters!

Learning unit tests and scripting with Hardhat and two simple contracts: Hello World and Ballot.

Working with:

- Typescript
- Chai
- Ethers
- Mocha
- Dotenv

## Test

```
yarn hardhat test
```

## Deploy

Put your .env file at root. It should contain:

```
PRIVATE_KEY=""
INFURA_API_KEY=""
INFURA_API_SECRET=""
ALCHEMY_API_KEY=""
ETHERSCAN_API_KEY=""
```

To run Deployment script:

```
yarn run ts-node --files ./scripts/Deployment.ts "Proposal 1" "Proposal 2" "Proposal 3"
```
