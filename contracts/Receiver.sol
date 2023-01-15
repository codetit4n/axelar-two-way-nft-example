// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executables/AxelarExecutable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";

contract Receiver is AxelarExecutable {
    constructor(address gateway_) AxelarExecutable(gateway_) {}

    function _execute(
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) internal override {
        (uint256 nonce, bytes memory payloadActual) = abi.decode(
            payload,
            (uint256, bytes)
        );
        //@todo ERC721 ownership check logic goes here

        gateway.callContract(sourceChain, sourceAddress, abi.encode(nonce));
        // Add code here to do something after sending response to source chain
        // _executePostAck(sourceChain, sourceAddress, payloadActual);
    }

    // function _executePostAck(
    //     string memory sourceChain,
    //     string memory sourceAddress,
    //     bytes memory payload
    // ) internal virtual {}
}
