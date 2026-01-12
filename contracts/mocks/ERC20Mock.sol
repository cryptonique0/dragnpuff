// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ERC20Mock
 * @dev Mock ERC20 contract for testing purposes
 */
contract ERC20Mock is ERC20 {
    constructor() ERC20("Mock NOM Token", "MNOM") {}

    /**
     * @dev Public mint function for testing
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens for testing
     */
    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}
