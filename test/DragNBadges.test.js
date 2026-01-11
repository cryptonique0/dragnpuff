const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DragNBadges", function () {
  let badges, owner, user;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("DragNBadges");
    badges = await Factory.deploy();
    await badges.waitForDeployment();
  });

  it("awards and prevents transfers", async () => {
    const tx = await badges.awardBadge(await user.getAddress(), 1); // FirstMint
    await tx.wait();
    expect(await badges.hasBadge(await user.getAddress(), 1)).to.equal(true);
    // transfers revert
    await expect(badges.transferFrom(await user.getAddress(), owner.address, 1)).to.be.revertedWith("Soulbound: non-transferable");
  });
});
