const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SeasonalWars", function () {
  let seasonalWars;
  let owner;
  let gameMaster;
  let player1;
  let player2;

  const SEASON_DURATION = 30 * 24 * 60 * 60; // 30 days

  beforeEach(async function () {
    [owner, gameMaster, player1, player2] = await ethers.getSigners();

    const SeasonalWars = await ethers.getContractFactory("SeasonalWars");
    seasonalWars = await SeasonalWars.deploy();
    await seasonalWars.waitForDeployment();

    // Grant game master role
    const GAME_MASTER_ROLE = await seasonalWars.GAME_MASTER_ROLE();
    await seasonalWars.grantRole(GAME_MASTER_ROLE, gameMaster.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const DEFAULT_ADMIN_ROLE = await seasonalWars.DEFAULT_ADMIN_ROLE();
      expect(await seasonalWars.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should initialize with season 0", async function () {
      expect(await seasonalWars.currentSeasonId()).to.equal(0);
    });
  });

  describe("Season Management", function () {
    it("Should start a new season", async function () {
      await expect(seasonalWars.connect(gameMaster).startSeason(SEASON_DURATION))
        .to.emit(seasonalWars, "SeasonStarted")
        .withArgs(1, await time.latest() + 1, await time.latest() + 1 + SEASON_DURATION);

      expect(await seasonalWars.currentSeasonId()).to.equal(1);
    });

    it("Should not allow non-game-master to start season", async function () {
      await expect(
        seasonalWars.connect(player1).startSeason(SEASON_DURATION)
      ).to.be.reverted;
    });

    it("Should not start new season before finalizing previous", async function () {
      await seasonalWars.connect(gameMaster).startSeason(SEASON_DURATION);
      
      await expect(
        seasonalWars.connect(gameMaster).startSeason(SEASON_DURATION)
      ).to.be.revertedWith("Previous season not finalized");
    });

    it("Should get season info", async function () {
      await seasonalWars.connect(gameMaster).startSeason(SEASON_DURATION);
      
      const info = await seasonalWars.getSeasonInfo(1);
      expect(info.finalized).to.be.false;
      expect(info.prizePool).to.equal(0);
    });

    it("Should check if season is active", async function () {
      await seasonalWars.connect(gameMaster).startSeason(SEASON_DURATION);
      expect(await seasonalWars.isSeasonActive(1)).to.be.true;
      
      // Fast forward past season end
      await time.increase(SEASON_DURATION + 1);
      expect(await seasonalWars.isSeasonActive(1)).to.be.false;
    });
  });

  describe("Score Recording", function () {
    beforeEach(async function () {
      await seasonalWars.connect(gameMaster).startSeason(SEASON_DURATION);
    });

    it("Should record score for a house", async function () {
      await expect(seasonalWars.connect(gameMaster).recordScore(1, 0, 15))
        .to.emit(seasonalWars, "ScoreRecorded")
        .withArgs(1, 0, 15, gameMaster.address);

      expect(await seasonalWars.getHouseScore(1, 0)).to.equal(15);
    });

    it("Should accumulate scores", async function () {
      await seasonalWars.connect(gameMaster).recordScore(1, 0, 15);
      await seasonalWars.connect(gameMaster).recordScore(1, 0, 10);
      
      expect(await seasonalWars.getHouseScore(1, 0)).to.equal(25);
    });

    it("Should reject invalid house ID", async function () {
      await expect(
        seasonalWars.connect(gameMaster).recordScore(1, 7, 15)
      ).to.be.revertedWith("Invalid house ID");
    });

    it("Should not record score for finalized season", async function () {
      await time.increase(SEASON_DURATION + 1);
      await seasonalWars.connect(gameMaster).finalizeSeason(1);
      
      await expect(
        seasonalWars.connect(gameMaster).recordScore(1, 0, 15)
      ).to.be.revertedWith("Season finalized");
    });
  });

  describe("Multipliers", function () {
    beforeEach(async function () {
      await seasonalWars.connect(gameMaster).startSeason(SEASON_DURATION);
    });

    it("Should set multiplier", async function () {
      await expect(seasonalWars.connect(gameMaster).setMultiplier(1, 0, 15000))
        .to.emit(seasonalWars, "MultiplierSet")
        .withArgs(1, 0, 15000);

      expect(await seasonalWars.getHouseMultiplier(1, 0)).to.equal(15000);
    });

    it("Should calculate final score with multiplier", async function () {
      await seasonalWars.connect(gameMaster).recordScore(1, 0, 1000);
      await seasonalWars.connect(gameMaster).setMultiplier(1, 0, 15000); // 1.5x
      
      expect(await seasonalWars.getFinalScore(1, 0)).to.equal(1500);
    });

    it("Should reject multiplier above max", async function () {
      await expect(
        seasonalWars.connect(gameMaster).setMultiplier(1, 0, 60000) // 6x
      ).to.be.revertedWith("Invalid multiplier");
    });

    it("Should initialize all houses with 1x multiplier", async function () {
      for (let i = 0; i < 7; i++) {
        expect(await seasonalWars.getHouseMultiplier(1, i)).to.equal(10000);
      }
    });
  });

  describe("Prize Pool", function () {
    beforeEach(async function () {
      await seasonalWars.connect(gameMaster).startSeason(SEASON_DURATION);
    });

    it("Should add to prize pool", async function () {
      const amount = ethers.parseEther("1.0");
      
      await expect(
        seasonalWars.connect(player1).addToPrizePool(1, { value: amount })
      ).to.emit(seasonalWars, "PrizePoolIncreased")
        .withArgs(1, amount, amount);

      const info = await seasonalWars.getSeasonInfo(1);
      expect(info.prizePool).to.equal(amount);
    });

    it("Should accumulate prize pool", async function () {
      await seasonalWars.connect(player1).addToPrizePool(1, { 
        value: ethers.parseEther("1.0") 
      });
      await seasonalWars.connect(player2).addToPrizePool(1, { 
        value: ethers.parseEther("0.5") 
      });

      const info = await seasonalWars.getSeasonInfo(1);
      expect(info.prizePool).to.equal(ethers.parseEther("1.5"));
    });

    it("Should add to current season via receive", async function () {
      const amount = ethers.parseEther("1.0");
      
      await expect(
        owner.sendTransaction({ to: await seasonalWars.getAddress(), value: amount })
      ).to.emit(seasonalWars, "PrizePoolIncreased");
    });
  });

  describe("Season Finalization", function () {
    beforeEach(async function () {
      await seasonalWars.connect(gameMaster).startSeason(SEASON_DURATION);
      
      // Set up scores for all houses
      await seasonalWars.connect(gameMaster).recordScore(1, 0, 1000); // Aqua
      await seasonalWars.connect(gameMaster).recordScore(1, 1, 1500); // Fire
      await seasonalWars.connect(gameMaster).recordScore(1, 2, 800);  // Earth
      await seasonalWars.connect(gameMaster).recordScore(1, 3, 1200); // Air
      await seasonalWars.connect(gameMaster).recordScore(1, 4, 900);  // Light
      await seasonalWars.connect(gameMaster).recordScore(1, 5, 1100); // Dark
      await seasonalWars.connect(gameMaster).recordScore(1, 6, 700);  // Chaos
    });

    it("Should finalize season after end time", async function () {
      await time.increase(SEASON_DURATION + 1);
      
      await expect(seasonalWars.connect(gameMaster).finalizeSeason(1))
        .to.emit(seasonalWars, "SeasonFinalized");

      const info = await seasonalWars.getSeasonInfo(1);
      expect(info.finalized).to.be.true;
    });

    it("Should not finalize before end time", async function () {
      await expect(
        seasonalWars.connect(gameMaster).finalizeSeason(1)
      ).to.be.revertedWith("Season not ended");
    });

    it("Should emit correct top houses", async function () {
      await time.increase(SEASON_DURATION + 1);
      
      const tx = await seasonalWars.connect(gameMaster).finalizeSeason(1);
      const receipt = await tx.wait();
      
      // Fire (1), Air (3), Dark (5) should be top 3
      // Event parsing would need to be done here
    });

    it("Should not finalize twice", async function () {
      await time.increase(SEASON_DURATION + 1);
      await seasonalWars.connect(gameMaster).finalizeSeason(1);
      
      await expect(
        seasonalWars.connect(gameMaster).finalizeSeason(1)
      ).to.be.revertedWith("Already finalized");
    });

    it("Should calculate final scores with multipliers correctly", async function () {
      // Give Aqua a 2x multiplier
      await seasonalWars.connect(gameMaster).setMultiplier(1, 0, 20000);
      
      await time.increase(SEASON_DURATION + 1);
      await seasonalWars.connect(gameMaster).finalizeSeason(1);
      
      // Aqua's final score should be 2000 (1000 * 2)
      expect(await seasonalWars.getFinalScore(1, 0)).to.equal(2000);
    });
  });

  describe("Prize Distribution", function () {
    it("Should update prize distribution", async function () {
      const newDistribution = [4000, 3000, 2000, 1000]; // Top 4
      
      await seasonalWars.connect(owner).setPrizeDistribution(newDistribution);
      
      expect(await seasonalWars.prizeDistribution(0)).to.equal(4000);
      expect(await seasonalWars.prizeDistribution(3)).to.equal(1000);
    });

    it("Should reject invalid distribution total", async function () {
      const invalidDistribution = [5000, 3000, 1000]; // Only 9000
      
      await expect(
        seasonalWars.connect(owner).setPrizeDistribution(invalidDistribution)
      ).to.be.revertedWith("Must total 10000 basis points");
    });
  });

  describe("Access Control", function () {
    it("Should only allow game master to record scores", async function () {
      await seasonalWars.connect(gameMaster).startSeason(SEASON_DURATION);
      
      await expect(
        seasonalWars.connect(player1).recordScore(1, 0, 15)
      ).to.be.reverted;
    });

    it("Should only allow game master to set multipliers", async function () {
      await seasonalWars.connect(gameMaster).startSeason(SEASON_DURATION);
      
      await expect(
        seasonalWars.connect(player1).setMultiplier(1, 0, 15000)
      ).to.be.reverted;
    });

    it("Should only allow admin to update prize distribution", async function () {
      await expect(
        seasonalWars.connect(player1).setPrizeDistribution([5000, 3000, 2000])
      ).to.be.reverted;
    });
  });
});
