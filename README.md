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
CHAIRPERSON_PRIVATE_KEY=
VOTER_PRIVATE_KEY=
BALLOT_CONTRACT_ADDRESS=
INFURA_API_KEY=
INFURA_API_SECRET=
ALCHEMY_API_KEY=
ETHERSCAN_API_KEY=
```

To run Deployment script, pass proposals as arguments:

```
yarn run ts-node --files ./scripts/Deployment.ts "Proposal 1" "Proposal 2" "Proposal 3"
```

### Give right to vote

To run GiveRightToVote script, pass address to give rights as argument:

```
yarn run ts-node --files ./scripts/GiveRightToVote.ts "0x4Aa83C6c99d7B6Ec196772D69A2ccC862B1800D2"
```

### Vote

To run CastVote script, pass proposal index to vote as argument:

```
yarn run ts-node --files ./scripts/CastVote.ts "1"
```
