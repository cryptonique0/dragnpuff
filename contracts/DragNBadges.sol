// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DragNBadges (Soulbound)
 * @dev Non-transferable ERC721 for achievements & badges.
 */
contract DragNBadges is ERC721Enumerable, Ownable {
    enum BadgeType { Unknown, FirstMint, TenFireBreaths, SeasonTop10 }

    // tokenId => badge type
    mapping(uint256 => BadgeType) private _badgeTypeOf;
    // badge type => base tokenURI
    mapping(uint8 => string) private _badgeURIs;

    event BadgeAwarded(address indexed to, uint256 indexed tokenId, BadgeType badge);
    event BadgeURISet(uint8 indexed badgeType, string uri);

    constructor() ERC721("DragN Badges", "DRAGNBADGE") {}

    function _makeTokenId(address to, BadgeType badge) internal pure returns (uint256) {
        return uint256(keccak256(abi.encode(to, badge)));
    }

    function setBadgeURI(uint8 badgeType, string calldata uri) external onlyOwner {
        _badgeURIs[badgeType] = uri;
        emit BadgeURISet(badgeType, uri);
    }

    function badgeTypeOf(uint256 tokenId) external view returns (BadgeType) {
        return _badgeTypeOf[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        uint8 b = uint8(_badgeTypeOf[tokenId]);
        string memory base = _badgeURIs[b];
        return bytes(base).length > 0 ? base : "";
    }

    function hasBadge(address account, BadgeType badge) public view returns (bool) {
        uint256 tokenId = _makeTokenId(account, badge);
        return _ownerOf(tokenId) != address(0);
    }

    function awardBadge(address to, BadgeType badge) external onlyOwner returns (uint256) {
        require(to != address(0), "Invalid address");
        require(badge != BadgeType.Unknown, "Invalid badge");
        uint256 tokenId = _makeTokenId(to, badge);
        require(_ownerOf(tokenId) == address(0), "Already awarded");
        _safeMint(to, tokenId);
        _badgeTypeOf[tokenId] = badge;
        emit BadgeAwarded(to, tokenId, badge);
        return tokenId;
    }

    // Soulbound restrictions: disable approvals and transfers
    function approve(address to, uint256 tokenId) public override {
        revert("Soulbound: approvals disabled");
    }

    function setApprovalForAll(address operator, bool approved) public override {
        revert("Soulbound: approvals disabled");
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        revert("Soulbound: non-transferable");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        revert("Soulbound: non-transferable");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        revert("Soulbound: non-transferable");
    }
}
