pragma solidity >=0.6.0 <0.8.0;

import "./ERC20.sol";

contract DummyERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 100 * 10**uint(decimals()));
    }
}