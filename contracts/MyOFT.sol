// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {OFT} from "@layerzerolabs/oft-evm/contracts/OFT.sol";

contract MyOFT is Ownable, OFT {
    error NotOwnerOrEndpoint();

    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate
    ) OFT(_name, _symbol, _lzEndpoint, _delegate) Ownable(_delegate) {}

    modifier onlyOwnerOrEndpoint() {
        if (msg.sender != address(endpoint) && msg.sender != owner()) {
            revert NotOwnerOrEndpoint();
        }
        _;
    }

    function mint(address _to, uint256 _amount) public onlyOwnerOrEndpoint {
        _mint(_to, _amount);
    }
}
