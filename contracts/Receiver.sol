// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executables/AxelarExecutable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

contract Receiver is AxelarExecutable {
    using ERC165Checker for address;
    bytes4 public constant IID_IERC721 = type(IERC721).interfaceId;

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
        //decoding the 3 params from source chain
        (address user, address nftAddr, uint256 tokenId) = abi.decode(
            payloadActual,
            (address, address, uint256)
        );
        bool isOwner = false;
        if (isERC721(nftAddr)) {
            try IERC721(nftAddr).ownerOf(tokenId) {
                if (IERC721(nftAddr).ownerOf(tokenId) == user) {
                    isOwner = true;
                }
            } catch {}
        }
        bytes memory payloadNew = abi.encode(nonce, isOwner);
        gateway.callContract(sourceChain, sourceAddress, payloadNew);
        // Add code here to do something after sending response to source chain
        // _executePostAck(sourceChain, sourceAddress, payloadActual);
    }

    // checks if an address is ERC721 compliant or not
    function isERC721(address nftAddress) public view returns (bool) {
        return nftAddress.supportsInterface(IID_IERC721);
    }

    // function _executePostAck(
    //     string memory sourceChain,
    //     string memory sourceAddress,
    //     bytes memory payload
    // ) internal virtual {}
}
