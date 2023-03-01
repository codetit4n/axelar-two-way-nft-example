# axelar-two-way-nft-example - Archived
> **Warning**
> This is a public archived repository. Some things might not work!

## Task
Deploy a normal contract on any chain which sends 3 params
1. NFT contract address 
2. NFT token id
3. User address who is interacting 

On the second chain, deploy an NFT contract, and with params coming from 1st chain check if the user address is the owner of the NFT and return true/false back to 1st chain.

### Information regarding my implementation
Testnet chains docs: https://docs.axelar.dev/dev/build/contract-addresses/testnet

The two chains I am choosing are:
1. Avalanche FUJI Testnet - Chain Id: 43113 - Source chain
2. Moonbase Alpha testnet - Chain Id: 1287 - Destination chain

So, the params 'Sender' contract will be on Avalanche and the params 'Receiver'/NFT ownership checker contract will be on Moonbase.

Gas will be paid on the Source chain for both sides.

### Latest addresses being used in the client

- Sender contract (Avalanche FUJI chain): 0x124edb971F290A41055A0f98e9302878d5877829
- Receiver contract (Moonbase Alpha chain): 0xB5d8196AE369930d0491504C2Bb869E2601635a6
- TestNft contract (Moonbase Alpha chain): 0xAb37A337a1bB6925Ab0d8b084320F14AaD08A92f

To deploy the contracts for testing run:
```bash
npx hardhat run scripts/deploy.js
```

I have used the axelar SDK for estimating gas in the react app (client folder).

## To run the react app for testing

Go inside the client folder:
```bash
cd client
```
Install node modules:
```bash
npm i
```
Run the app on localhost:
```bash
npm start
```
