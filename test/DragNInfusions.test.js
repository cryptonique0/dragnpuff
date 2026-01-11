const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DragNInfusions", function () {
  let dragNInfusions;
  let dragNContract;
  let nomToken;
  let owner;
  let user1;
  let user2;

  const CHARM_NAME = "FireGlow";
  const CHARM_COST = ethers.parseEther("50");
  const CHARM_RARITY = 3;
  const BASE_UPGRADE_COST = ethers.parseEther("100");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Mock DragN contract
    const DragNPuff = await ethers.getContractFactory("ERC721Mock");
    dragNContract = await DragNPuff.deploy();
    await dragNContract.waitForDeployment();

    // Mock NOM token
    const NomToken = await ethers.getContractFactory("ERC20Mock");
    nomToken = await NomToken.deploy();
    await nomToken.waitForDeployment();

    // Deploy DragNInfusions
    const DragNInfusions = await ethers.getContractFactory("DragNInfusions");
    dragNInfusions = await DragNInfusions.deploy(
      await dragNContract.getAddress(),
      await nomToken.getAddress()
    );
    await dragNInfusions.waitForDeployment();

    // Mint test DragN
    await dragNContract.mint(user1.address, 1);
    await dragNContract.mint(user2.address, 2);

    // Mint test NOM tokens
    await nomToken.mint(user1.address, ethers.parseEther("10000"));
    await nomToken.mint(user2.address, ethers.parseEther("10000"));

    // Approve DragNInfusions to spend NOM
    await nomToken.connect(user1).approve(
      await dragNInfusions.getAddress(),
      ethers.parseEther("10000")
    );
    await nomToken.connect(user2).approve(
      await dragNInfusions.getAddress(),
      ethers.parseEther("10000")
    );
  });

  describe("Charm Management", function () {
    it("Should create a new charm", async function () {
      await dragNInfusions.createCharm(
        CHARM_NAME,
        "A fiery glow charm",
        CHARM_COST,
        CHARM_RARITY
      );

      const charm = await dragNInfusions.charms(CHARM_NAME);
      expect(charm.name).to.equal(CHARM_NAME);
      expect(charm.cost).to.equal(CHARM_COST);
      expect(charm.rarity).to.equal(CHARM_RARITY);
      expect(charm.active).to.be.true;
    });

    it("Should not allow duplicate charm names", async function () {
      await dragNInfusions.createCharm(
        CHARM_NAME,
        "First charm",
        CHARM_COST,
        CHARM_RARITY
      );

      await expect(
        dragNInfusions.createCharm(
          CHARM_NAME,
          "Second charm",
          CHARM_COST,
          CHARM_RARITY
        )
      ).to.be.revertedWith("Charm already exists");
    });

    it("Should reject invalid rarity", async function () {
      await expect(
        dragNInfusions.createCharm(
          CHARM_NAME,
          "Invalid rarity",
          CHARM_COST,
          6 // Invalid: must be 1-5
        )
      ).to.be.revertedWith("Invalid rarity");
    });

    it("Should update charm cost", async function () {
      await dragNInfusions.createCharm(
        CHARM_NAME,
        "A charm",
        CHARM_COST,
        CHARM_RARITY
      );

      const newCost = ethers.parseEther("75");
      await dragNInfusions.updateCharmCost(CHARM_NAME, newCost);

      const charm = await dragNInfusions.charms(CHARM_NAME);
      expect(charm.cost).to.equal(newCost);
    });

    it("Should disable a charm", async function () {
      await dragNInfusions.createCharm(
        CHARM_NAME,
        "A charm",
        CHARM_COST,
        CHARM_RARITY
      );

      await dragNInfusions.disableCharm(CHARM_NAME);

      const charm = await dragNInfusions.charms(CHARM_NAME);
      expect(charm.active).to.be.false;
    });

    it("Should get all charms", async function () {
      await dragNInfusions.createCharm("Charm1", "First", CHARM_COST, 1);
      await dragNInfusions.createCharm("Charm2", "Second", CHARM_COST, 2);
      await dragNInfusions.createCharm("Charm3", "Third", CHARM_COST, 3);

      const charms = await dragNInfusions.getAllCharms();
      expect(charms.length).to.equal(3);
    });
  });

  describe("Charm Application", function () {
    beforeEach(async function () {
      await dragNInfusions.createCharm(
        CHARM_NAME,
        "A fiery glow",
        CHARM_COST,
        CHARM_RARITY
      );
    });

    it("Should apply a charm to a DragN", async function () {
      await dragNInfusions
        .connect(user1)
        .applyCharm(1, CHARM_NAME);

      const hasCharm = await dragNInfusions.hasCharm(1, CHARM_NAME);
      expect(hasCharm).to.be.true;
    });

    it("Should not allow non-owner to apply charm", async function () {
      await expect(
        dragNInfusions.connect(user2).applyCharm(1, CHARM_NAME)
      ).to.be.revertedWith("Not DragN owner");
    });

    it("Should not allow applying same charm twice", async function () {
      await dragNInfusions.connect(user1).applyCharm(1, CHARM_NAME);

      await expect(
        dragNInfusions.connect(user1).applyCharm(1, CHARM_NAME)
      ).to.be.revertedWith("Charm already applied");
    });

    it("Should track NOM spending", async function () {
      await dragNInfusions.connect(user1).applyCharm(1, CHARM_NAME);

      const spent = await dragNInfusions.getUserSpending(user1.address);
      expect(spent).to.equal(CHARM_COST);
    });

    it("Should transfer NOM to contract", async function () {
      const balanceBefore = await nomToken.balanceOf(user1.address);

      await dragNInfusions.connect(user1).applyCharm(1, CHARM_NAME);

      const balanceAfter = await nomToken.balanceOf(user1.address);
      expect(balanceBefore - balanceAfter).to.equal(CHARM_COST);
    });

    it("Should get token charms", async function () {
      await dragNInfusions.connect(user1).applyCharm(1, CHARM_NAME);

      const charms = await dragNInfusions.getTokenCharms(1);
      expect(charms.length).to.equal(1);
      expect(charms[0]).to.equal(CHARM_NAME);
    });

    it("Should apply multiple different charms", async function () {
      await dragNInfusions.createCharm("Charm2", "Second", CHARM_COST, 2);

      await dragNInfusions.connect(user1).applyCharm(1, CHARM_NAME);
      await dragNInfusions.connect(user1).applyCharm(1, "Charm2");

      const charms = await dragNInfusions.getTokenCharms(1);
      expect(charms.length).to.equal(2);
    });
  });

  describe("Charm Removal", function () {
    beforeEach(async function () {
      await dragNInfusions.createCharm(
        CHARM_NAME,
        "A charm",
        CHARM_COST,
        CHARM_RARITY
      );
      await dragNInfusions.connect(user1).applyCharm(1, CHARM_NAME);
    });

    it("Should remove a charm (owner only)", async function () {
      await dragNInfusions.removeCharm(1, CHARM_NAME);

      const hasCharm = await dragNInfusions.hasCharm(1, CHARM_NAME);
      expect(hasCharm).to.be.false;
    });

    it("Should not allow non-owner to remove charm", async function () {
      await expect(
        dragNInfusions.connect(user1).removeCharm(1, CHARM_NAME)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not remove non-existent charm", async function () {
      await expect(
        dragNInfusions.removeCharm(1, "NonExistent")
      ).to.be.revertedWith("Charm not applied");
    });
  });

  describe("Trait Upgrades", function () {
    it("Should upgrade a trait", async function () {
      await dragNInfusions
        .connect(user1)
        .upgradetrait(1, "color", "golden", 2);

      const upgrades = await dragNInfusions.getTraitUpgrades(1);
      expect(upgrades.length).to.equal(1);
      expect(upgrades[0].traitName).to.equal("color");
      expect(upgrades[0].newValue).to.equal("golden");
    });

    it("Should calculate upgrade cost correctly", async function () {
      const baseCost = await dragNInfusions.upgradeBaseCost();
      const multiplier = 3;
      const expectedCost = baseCost * BigInt(multiplier);

      await dragNInfusions
        .connect(user1)
        .upgradetrait(1, "scale", "silver", multiplier);

      const upgrades = await dragNInfusions.getTraitUpgrades(1);
      expect(upgrades[0].cost).to.equal(expectedCost);
    });

    it("Should reject invalid multiplier", async function () {
      await expect(
        dragNInfusions.connect(user1).upgradetrait(1, "trait", "value", 6)
      ).to.be.revertedWith("Invalid multiplier");
    });

    it("Should allow multiple upgrades on same trait", async function () {
      await dragNInfusions
        .connect(user1)
        .upgradetrait(1, "color", "red", 1);
      await dragNInfusions
        .connect(user1)
        .upgradetrait(1, "color", "blue", 1);

      const upgrades = await dragNInfusions.getTraitUpgrades(1);
      expect(upgrades.length).to.equal(2);
    });

    it("Should track total spending on upgrades", async function () {
      const baseCost = await dragNInfusions.upgradeBaseCost();

      await dragNInfusions
        .connect(user1)
        .upgradetrait(1, "color", "gold", 2);

      const spent = await dragNInfusions.getUserSpending(user1.address);
      expect(spent).to.equal(baseCost * BigInt(2));
    });
  });

  describe("Infusion Score", function () {
    beforeEach(async function () {
      await dragNInfusions.createCharm("Charm1", "First", CHARM_COST, 1);
      await dragNInfusions.createCharm("Charm2", "Second", CHARM_COST, 3);
      await dragNInfusions.createCharm("Charm3", "Third", CHARM_COST, 5);
    });

    it("Should calculate infusion score from charms", async function () {
      await dragNInfusions.connect(user1).applyCharm(1, "Charm2");

      const score = await dragNInfusions.calculateInfusionScore(1);
      // Charm with rarity 3: 3 * 10 = 30
      expect(score).to.equal(30);
    });

    it("Should add score for upgrades", async function () {
      await dragNInfusions.connect(user1).upgradetrait(1, "color", "gold", 1);
      await dragNInfusions.connect(user1).upgradetrait(1, "scale", "large", 1);

      const score = await dragNInfusions.calculateInfusionScore(1);
      // 2 upgrades * 5 = 10
      expect(score).to.equal(10);
    });

    it("Should calculate combined score", async function () {
      await dragNInfusions.connect(user1).applyCharm(1, "Charm3");
      await dragNInfusions.connect(user1).upgradetrait(1, "color", "gold", 1);

      const score = await dragNInfusions.calculateInfusionScore(1);
      // Charm rarity 5: 5 * 10 = 50
      // 1 upgrade: 1 * 5 = 5
      // Total: 55
      expect(score).to.equal(55);
    });
  });

  describe("Token Infusion Data", function () {
    beforeEach(async function () {
      await dragNInfusions.createCharm(CHARM_NAME, "A charm", CHARM_COST, 3);
      await dragNInfusions.connect(user1).applyCharm(1, CHARM_NAME);
      await dragNInfusions
        .connect(user1)
        .upgradetrait(1, "color", "golden", 2);
    });

    it("Should get complete infusion metadata", async function () {
      const data = await dragNInfusions.getTokenInfusionData(1);

      expect(data.tokenId).to.equal(1);
      expect(data.charms.length).to.equal(1);
      expect(data.charms[0]).to.equal(CHARM_NAME);
      expect(data.upgrades.length).to.equal(1);
      expect(data.totalSpent).to.equal(CHARM_COST + BASE_UPGRADE_COST * BigInt(2));
      expect(data.infusionScore).to.be.gt(0);
    });
  });

  describe("EIP-712 Signatures", function () {
    beforeEach(async function () {
      await dragNInfusions.createCharm(CHARM_NAME, "A charm", CHARM_COST, 3);
    });

    it("Should apply charm with valid signature", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const nonce = await dragNInfusions.getNonce(user1.address);

      const domain = {
        name: 'DragNInfusions',
        version: '1',
        chainId: 31337,
        verifyingContract: await dragNInfusions.getAddress()
      };

      const types = {
        ApplyCharm: [
          { name: 'user', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'charmName', type: 'string' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      };

      const value = {
        user: user1.address,
        tokenId: 1,
        charmName: CHARM_NAME,
        nonce: nonce.toString(),
        deadline
      };

      const signature = await user1.signTypedData(domain, types, value);

      await dragNInfusions.applyCharmSigned(
        user1.address,
        1,
        CHARM_NAME,
        deadline,
        signature
      );

      const hasCharm = await dragNInfusions.hasCharm(1, CHARM_NAME);
      expect(hasCharm).to.be.true;
    });

    it("Should reject expired signature", async function () {
      const deadline = Math.floor(Date.now() / 1000) - 1; // Expired
      const nonce = await dragNInfusions.getNonce(user1.address);

      const domain = {
        name: 'DragNInfusions',
        version: '1',
        chainId: 31337,
        verifyingContract: await dragNInfusions.getAddress()
      };

      const types = {
        ApplyCharm: [
          { name: 'user', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'charmName', type: 'string' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      };

      const value = {
        user: user1.address,
        tokenId: 1,
        charmName: CHARM_NAME,
        nonce: nonce.toString(),
        deadline
      };

      const signature = await user1.signTypedData(domain, types, value);

      await expect(
        dragNInfusions.applyCharmSigned(
          user1.address,
          1,
          CHARM_NAME,
          deadline,
          signature
        )
      ).to.be.revertedWith("Signature expired");
    });

    it("Should increment nonce after signature", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const nonceBefore = await dragNInfusions.getNonce(user1.address);

      const domain = {
        name: 'DragNInfusions',
        version: '1',
        chainId: 31337,
        verifyingContract: await dragNInfusions.getAddress()
      };

      const types = {
        ApplyCharm: [
          { name: 'user', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'charmName', type: 'string' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      };

      const value = {
        user: user1.address,
        tokenId: 1,
        charmName: CHARM_NAME,
        nonce: nonceBefore.toString(),
        deadline
      };

      const signature = await user1.signTypedData(domain, types, value);

      await dragNInfusions.applyCharmSigned(
        user1.address,
        1,
        CHARM_NAME,
        deadline,
        signature
      );

      const nonceAfter = await dragNInfusions.getNonce(user1.address);
      expect(nonceAfter).to.equal(nonceBefore + 1n);
    });
  });

  describe("Fee Management", function () {
    beforeEach(async function () {
      await dragNInfusions.createCharm(CHARM_NAME, "A charm", CHARM_COST, 3);
    });

    it("Should apply charm apply fee", async function () {
      const fee = ethers.parseEther("10");
      await dragNInfusions.setCharmApplyFee(fee);

      await dragNInfusions.connect(user1).applyCharm(1, CHARM_NAME);

      const spent = await dragNInfusions.getUserSpending(user1.address);
      expect(spent).to.equal(CHARM_COST + fee);
    });

    it("Should update upgrade base cost", async function () {
      const newCost = ethers.parseEther("200");
      await dragNInfusions.setUpgradeBaseCost(newCost);

      await dragNInfusions.connect(user1).upgradetrait(1, "color", "gold", 1);

      const upgrades = await dragNInfusions.getTraitUpgrades(1);
      expect(upgrades[0].cost).to.equal(newCost);
    });

    it("Should withdraw collected NOM", async function () {
      await dragNInfusions.connect(user1).applyCharm(1, CHARM_NAME);

      const balanceBefore = await nomToken.balanceOf(owner.address);
      await dragNInfusions.withdraw(CHARM_COST);
      const balanceAfter = await nomToken.balanceOf(owner.address);

      expect(balanceAfter - balanceBefore).to.equal(CHARM_COST);
    });
  });
});
