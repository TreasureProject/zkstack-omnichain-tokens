// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ONFT721Adapter} from "@layerzerolabs/onft-evm/contracts/onft721/ONFT721Adapter.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract MyONFTAdapter is ONFT721Adapter {
    constructor(
        address _token,
        address _lzEndpoint,
        address _delegate
    ) ONFT721Adapter(_token, _lzEndpoint, _delegate) {
        innerToken = IERC721(_token);
    }
}
