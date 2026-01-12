// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title ERC721Mock
 * @dev Mock ERC721 contract for testing purposes
 */
contract ERC721Mock is ERC721 {
    constructor() ERC721("Mock DragN", "MDRAGN") {}

    /**
     * @dev Public mint function for testing
     */
    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    /**
     * @dev Batch mint for testing
     */
    function batchMint(address to, uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _mint(to, tokenIds[i]);
        }
    }
}
