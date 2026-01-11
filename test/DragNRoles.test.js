const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DragNRoles", function () {
  let dragNRoles;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const DragNRoles = await ethers.getContractFactory("DragNRoles");
    dragNRoles = await DragNRoles.deploy();
    await dragNRoles.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct initial modifiers", async function () {
      const scoutMods = await dragNRoles.getRoleModifiers(1);
      expect(scoutMods.attackMultiplier).to.equal(15000); // 1.5x
      expect(scoutMods.defenseMultiplier).to.equal(8000);  // 0.8x
    });
  });

  describe("Role Assignment", function () {
    it("Should assign role to DragN", async function () {
      await dragNRoles.assignRole(1, 1, 0); // Scout role
      
      expect(await dragNRoles.getDragNRole(1)).to.equal(1);
      expect(await dragNRoles.getDragNHouse(1)).to.equal(0);
    });

    it("Should reject invalid role ID", async function () {
      await expect(dragNRoles.assignRole(1, 5, 0))
        .to.be.revertedWith("Invalid role");
    });

    it("Should allow signed role assignment", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const domain = {
        name: 'DragNRoles',
        version: '1',
        chainId: 31337,
        verifyingContract: await dragNRoles.getAddress()
      };

      const types = {
        AssignRole: [
          { name: 'user', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'role', type: 'uint8' },
          { name: 'houseId', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      };

      const value = {
        user: user1.address,
        tokenId: 1,
        role: 1,
        houseId: 0,
        nonce: 0,
        deadline: deadline
      };

      const signature = await user1.signTypedData(domain, types, value);

      await dragNRoles.assignRoleSigned(
        user1.address,
        1,
        1,
        0,
        deadline,
        signature
      );

      expect(await dragNRoles.getDragNRole(1)).to.equal(1);
    });
  });

  describe("Loadout Management", function () {
    beforeEach(async function () {
      // Assign roles to some DragNs
      await dragNRoles.assignRole(1, 1, 0); // Scout
      await dragNRoles.assignRole(2, 2, 0); // Defender
      await dragNRoles.assignRole(3, 3, 0); // Support
    });

    it("Should update user loadout", async function () {
      await dragNRoles.updateLoadout(user1.address, [1, 2]);
      
      const loadout = await dragNRoles.getUserLoadout(user1.address);
      expect(loadout.length).to.equal(2);
      expect(loadout[0]).to.equal(1);
      expect(loadout[1]).to.equal(2);
    });

    it("Should check if DragN is loaded", async function () {
      await dragNRoles.updateLoadout(user1.address, [1, 2]);
      
      expect(await dragNRoles.isLoadedDragN(user1.address, 1)).to.be.true;
      expect(await dragNRoles.isLoadedDragN(user1.address, 3)).to.be.false;
    });

    it("Should reject loadout with unassigned DragN", async function () {
      await expect(dragNRoles.updateLoadout(user1.address, [1, 99]))
        .to.be.revertedWith("DragN has no role");
    });

    it("Should enforce max loadout size", async function () {
      // Assign more roles
      for (let i = 4; i <= 6; i++) {
        await dragNRoles.assignRole(i, 1, 0);
      }

      await expect(dragNRoles.updateLoadout(user1.address, [1, 2, 3, 4, 5, 6]))
        .to.be.revertedWith("Max 5 DragNs per loadout");
    });
  });

  describe("Modifiers", function () {
    it("Should apply attack multiplier correctly", async function () {
      await dragNRoles.assignRole(1, 1, 0); // Scout (1.5x attack)
      
      const result = await dragNRoles.applyRoleModifier(100, 1, "attack");
      expect(result).to.equal(150); // 100 * 1.5
    });

    it("Should apply defense multiplier", async function () {
      await dragNRoles.assignRole(2, 2, 0); // Defender (1.5x defense)
      
      const result = await dragNRoles.applyRoleModifier(100, 2, "defense");
      expect(result).to.equal(150);
    });

    it("Should apply recruit multiplier", async function () {
      await dragNRoles.assignRole(3, 3, 0); // Support (1.5x recruit)
      
      const result = await dragNRoles.applyRoleModifier(100, 3, "recruit");
      expect(result).to.equal(150);
    });

    it("Should allow admin to update modifiers", async function () {
      await dragNRoles.setRoleModifiers(1, 20000, 7000, 8000); // Scout 2x attack
      
      const mods = await dragNRoles.getRoleModifiers(1);
      expect(mods.attackMultiplier).to.equal(20000);
    });
  });

  describe("Nonce Management", function () {
    it("Should track action nonce", async function () {
      expect(await dragNRoles.getNonce(user1.address)).to.equal(0);
    });
  });

  describe("Role Removal", function () {
    beforeEach(async function () {
      await dragNRoles.assignRole(1, 1, 0);
      await dragNRoles.updateLoadout(user1.address, [1]);
    });

    it("Should remove role from DragN", async function () {
      await dragNRoles.removeRole(1);
      
      expect(await dragNRoles.getDragNRole(1)).to.equal(0); // Unassigned
    });

    it("Should remove DragN from loadout when role removed", async function () {
      await dragNRoles.connect(user1).removeRole(1);
      
      const loadout = await dragNRoles.getUserLoadout(user1.address);
      expect(loadout.length).to.equal(0);
    });
  });
});
