const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const SECONDS_IN_DAY = 24n * 60n * 60n;
const THIRTY_DAYS = 30n * SECONDS_IN_DAY;

async function deployStakingFixture() {
  const [owner, user, other] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("MockERC20");
  const token = await Token.deploy();
  const stakeAmount = ethers.parseEther("1000000");
  await token.mint(user.address, stakeAmount);

  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(token.target, owner.address);

  return { owner, user, other, token, staking };
}

function computeBoost(amount, lockSeconds, { boostUnitAmount, boostPerUnitBps, maxBonusBps }) {
  const weight = (amount * BigInt(lockSeconds)) / THIRTY_DAYS;
  const bonus = ((weight / boostUnitAmount) * boostPerUnitBps);
  const cappedBonus = bonus > maxBonusBps ? maxBonusBps : bonus;
  const BASE = 10000n; // BASE_MULTIPLIER_BPS
  return BASE + cappedBonus;
}

describe("Staking", function () {
  it("locks house choice once set", async function () {
    const { user, token, staking } = await loadFixture(deployStakingFixture);

    const amount = ethers.parseEther("1000");
    const lock = 60 * 24 * 60 * 60; // 60 days

    await token.connect(user).approve(staking.target, amount);
    await staking.connect(user).stakeForHouse(amount, 1, lock);

    await token.connect(user).approve(staking.target, amount);
    await expect(staking.connect(user).stakeForHouse(amount, 2, lock)).to.be.revertedWith("House already set");
  });

  it("computes weighted stake and boost multipliers", async function () {
    const { user, token, staking } = await loadFixture(deployStakingFixture);

    const amount = ethers.parseEther("20000");
    const lock = 60 * 24 * 60 * 60; // 60 days

    await token.connect(user).approve(staking.target, amount);
    const tx = await staking.connect(user).stakeForHouse(amount, 2, lock);
    await tx.wait();

    const expectedWeight = (amount * BigInt(lock)) / THIRTY_DAYS;
    const storedWeight = await staking.houseWeightedStake(2);
    expect(storedWeight).to.equal(expectedWeight);

    const boost = await staking.getHouseBoost(2);
    const expectedBoost = computeBoost(amount, lock, {
      boostUnitAmount: ethers.parseEther("10000"),
      boostPerUnitBps: 500n,
      maxBonusBps: 10000n,
    });
    expect(boost).to.equal(expectedBoost);
  });

  it("caps boost at maxBonusBps", async function () {
    const { user, token, staking } = await loadFixture(deployStakingFixture);

    const amount = ethers.parseEther("200000"); // large stake
    const lock = 180 * 24 * 60 * 60; // 180 days (max)

    await token.connect(user).approve(staking.target, amount);
    await staking.connect(user).stakeForHouse(amount, 3, lock);

    const boost = await staking.getHouseBoost(3);
    const BASE = 10000n;
    const maxBonus = 10000n;
    expect(boost).to.equal(BASE + maxBonus);
  });
});
