# Contracts documentation

There are 3 contracts here:
1. LyncNftContract.sol : This is the test ERC721 contract which will be deployed on moonbase alpha chain. It is simple ERC721 contract with simple function to mint any amount of NFTs for testing.
2. Sender.sol : This contract will be deployed on the Avalanche FUJI testnet chain, which will send the following 3 params:
    - NFT contract address - on moonbase alpha chain
    - NFT token id - on moonbase alpha chain
    - User address who is interacting - on Avalanche FUJI chain
3. Receiver.sol: This contract will be deployed on the Moonbase alpha chain which will verify the ownership of NFT and send back a response to the sender contract on Avalanche FUJI chain.