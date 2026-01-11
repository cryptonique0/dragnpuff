// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;
import "forge-std/Test.sol";
import "../contracts/DragNBadges.sol";

contract DragNBadgesTest is Test {
    DragNBadges badges;
    address admin = address(0xA11CE);
    address user = address(0xBEEF);

    function setUp() public {
        badges = new DragNBadges();
        badges.transferOwnership(admin);
        vm.prank(admin);
        badges.setBadgeURI(uint8(DragNBadges.BadgeType.FirstMint), "ipfs://badge-firstmint");
    }

    function testAwardAndNonTransferable() public {
        vm.prank(admin);
        uint256 tid = badges.awardBadge(user, DragNBadges.BadgeType.FirstMint);
        assertTrue(badges.hasBadge(user, DragNBadges.BadgeType.FirstMint));
        // transfers revert
        vm.expectRevert();
        badges.transferFrom(user, address(0x123), tid);
    }
}
