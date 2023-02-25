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
VOTER_THAT_VOTES_PRIVATE_KEY=
VOTER_THAT_DELEGATES_PRIVATE_KEY=
DELEGATED_PRIVATE_KEY=
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

First, give right to vote for that voter:

```
yarn run ts-node --files ./scripts/GiveRightToVote.ts "0x4Aa83C6c99d7B6Ec196772D69A2ccC862B1800D2"
```

Then, run CastVote script passing proposal index to vote as argument:

```
yarn run ts-node --files ./scripts/CastVote.ts "1"
```

### Delegate

First, give right to vote to voter that delegates.

```
yarn run ts-node --files ./scripts/GiveRightToVote.ts "0x5174bD7617E3Ec69c0f527d823535381FF052535"
```

Second, give right to delegation receiver.

```
yarn run ts-node --files ./scripts/GiveRightToVote.ts "0x935F4c3a76Ee49D8B00bAf388d11100529A0FF19"
```

Finally, run Delegate script passing address to delegate vote as argument:

```
yarn run ts-node --files ./scripts/Delegate.ts "0x935F4c3a76Ee49D8B00bAf388d11100529A0FF19"
```

### Winning proposal and winner name

To run WinningProposalAndWinnerName script:

```
yarn run ts-node --files ./scripts/WinningProposalAndWinnerName.ts
```
