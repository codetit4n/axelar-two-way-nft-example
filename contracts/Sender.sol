// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executables/AxelarExecutable.sol";
// import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import {StringToAddress, AddressToString} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/StringAddressUtils.sol";

contract Sender is AxelarExecutable {
    using StringToAddress for string;
    using AddressToString for address;

    error NotEnoughValueForGas();

    event ContractCallSent(
        string destinationChain,
        string contractAddress,
        bytes payload,
        uint256 nonce
    );
    event FalseAcknowledgment(
        string destinationChain,
        string contractAddress,
        uint256 nonce
    );

    uint256 public nonce;
    mapping(uint256 => bool) public executed;
    mapping(uint256 => bool) responses;
    mapping(uint256 => bytes32) public destination;
    IAxelarGasService public immutable gasReceiver;
    string public thisChain;

    constructor(
        address gateway_,
        address gasReceiver_,
        string memory thisChain_
    ) AxelarExecutable(gateway_) {
        gasReceiver = IAxelarGasService(gasReceiver_);
        thisChain = thisChain_;
    }

    function _getDestinationHash(
        string memory destinationChain,
        string memory contractAddress
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(destinationChain, contractAddress));
    }

    function sendContractCall(
        string calldata destinationChain,
        string calldata contractAddress,
        address nftAddr,
        uint256 tokenId,
        uint256 gasForRemote
    ) external payable {
        uint256 nonce_ = nonce;
        // make payload
        bytes memory payload = abi.encode(msg.sender, nftAddr, tokenId);
        // encode payload with nonce
        bytes memory modifiedPayload = abi.encode(nonce_, payload);
        if (gasForRemote > 0) {
            if (gasForRemote > msg.value) revert NotEnoughValueForGas();
            gasReceiver.payNativeGasForContractCall{value: gasForRemote}(
                address(this),
                destinationChain,
                contractAddress,
                modifiedPayload,
                msg.sender
            );
            if (msg.value > gasForRemote) {
                gasReceiver.payNativeGasForContractCall{
                    value: msg.value - gasForRemote
                }(
                    contractAddress.toAddress(),
                    thisChain,
                    address(this).toString(),
                    abi.encode(nonce_),
                    msg.sender
                );
            }
        }

        gateway.callContract(
            destinationChain,
            contractAddress,
            modifiedPayload
        );
        emit ContractCallSent(
            destinationChain,
            contractAddress,
            payload,
            nonce_
        );
        destination[nonce_] = _getDestinationHash(
            destinationChain,
            contractAddress
        );
        nonce = nonce_ + 1;
    }

    function _execute(
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) internal override {
        (uint256 nonce_, bool isOwner) = abi.decode(payload, (uint256, bool));
        if (
            destination[nonce_] !=
            _getDestinationHash(sourceChain, sourceAddress)
        ) {
            emit FalseAcknowledgment(sourceChain, sourceAddress, nonce_);
            return;
        }
        executed[nonce_] = true;
        destination[nonce_] = 0;
        // store response regarding ownership of NFT from reciever
        responses[nonce_] = isOwner;
    }

    function checkResponse(uint256 nonce_) public view returns (bool res) {
        if (executed[nonce_] == true) {
            res = responses[nonce_];
        } else {
            revert("No response yet!!!");
        }
    }
}
