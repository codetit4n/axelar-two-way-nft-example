const data = require('../testnets-data/testnet.json');
const { getDefaultProvider, Wallet } = require('ethers');
const { ethers } = require("hardhat");
const fs = require('fs')

async function main() {
  // Get wallet from private key
  const pvt_key = process.env.PVT_KEY;
  const wallet = new Wallet(pvt_key);
  // Get the testnet data of the 2 chains from the data provided by Axelar
  const Avalanche_info = data.find((chain) => chain.name === 'Avalanche');
  const Moonbase_info = data.find((chain) => chain.name === 'Moonbeam');
  console.log('Deployment in process...Please wait...');
  // Avalanche
  const providerAvalanche = getDefaultProvider(Avalanche_info.rpc);
  const accountOnAvalanche = wallet.connect(providerAvalanche);
  const SenderABI = await ethers.getContractFactory('Sender');
  const sender_contract = await SenderABI.connect(accountOnAvalanche).deploy(Avalanche_info.gateway, Avalanche_info.gasReceiver, Avalanche_info.name);
  console.log('Sender deployed to: ', sender_contract.address, ' on Avalanche FUJI chain');
  // Moonbase
  const providerMoonbase = getDefaultProvider(Moonbase_info.rpc);
  const accountOnMoonbase = wallet.connect(providerMoonbase);
  const ReceiverABI = await ethers.getContractFactory('Receiver');
  const receiver_contract = await ReceiverABI.connect(accountOnMoonbase).deploy(Moonbase_info.gateway);
  console.log('Receiver deployed to: ', receiver_contract.address, ' on Moonbase Alpha chain');
  const LyncNftABI = await ethers.getContractFactory('LyncNftContract');
  const nft_contract = await LyncNftABI.connect(accountOnMoonbase).deploy();
  console.log('LyncNftContract deployed to: ', nft_contract.address, ' on Moonbase Alpha chain');
  const toStore = {
    'Sender': {
      'address': sender_contract.address.toString(),
      'Chain': 'Avalanche'
    },
    'Receiver': {
      'address': receiver_contract.address.toString(),
      'Chain': 'Moonbase'
    },
    'TestNft': {
      'address': nft_contract.address.toString(),
      'Chain': 'Moonbase'
    }
  }
  const toStoreStringified = JSON.stringify(toStore);
  fs.writeFile("./client/src/blockchain-data/latest_addresses.json", toStoreStringified, function (err, result) {
    if (err) console.log('error', err);
  });
  console.log('Deployment complete...');
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
