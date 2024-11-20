// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ONFT721} from "@layerzerolabs/onft-evm/contracts/onft721/ONFT721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MyONFT is Ownable, ONFT721 {
    using Strings for uint256;

    uint256 private _nextTokenId = 1;
    uint256 private _totalSupply;

    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate,
        string memory _initialBaseURI
    ) ONFT721(_name, _symbol, _lzEndpoint, _delegate) {
        baseTokenURI = _initialBaseURI;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function mint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _totalSupply++;
        _safeMint(to, tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return
            string(abi.encodePacked(baseTokenURI, tokenId.toString(), ".json"));
    }
}
