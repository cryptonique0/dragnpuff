const { ethers } = require('ethers');
const db = require('../../firebase/config');

class InfusionsController {
  /**
   * GET /api/infusions/charms
   * Get all available charms
   */
  static async getAvailableCharms(req, res) {
    try {
      const contract = new ethers.Contract(
        process.env.DRAGNINFUSIONS_ADDRESS,
        require('../../artifacts/contracts/DragNInfusions.sol/DragNInfusions.json').abi,
        new ethers.JsonRpcProvider(process.env.RPC_URL)
      );

      const charms = await contract.getAllCharms();

      const formattedCharms = charms
        .filter(c => c.active)
        .map(c => ({
          name: c.name,
          description: c.description,
          cost: ethers.formatEther(c.cost) + ' $NOM',
          costRaw: c.cost.toString(),
          rarity: parseInt(c.rarity.toString()),
          rarityLabel: getRarityLabel(parseInt(c.rarity.toString()))
        }));

      res.json({
        success: true,
        charms: formattedCharms,
        count: formattedCharms.length
      });
    } catch (error) {
      console.error('Error fetching charms:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch charms'
      });
    }
  }

  /**
   * GET /api/infusions/dragn/:tokenId
   * Get infusion data for a specific DragN
   */
  static async getDragNInfusions(req, res) {
    try {
      const { tokenId } = req.params;

      const contract = new ethers.Contract(
        process.env.DRAGNINFUSIONS_ADDRESS,
        require('../../artifacts/contracts/DragNInfusions.sol/DragNInfusions.json').abi,
        new ethers.JsonRpcProvider(process.env.RPC_URL)
      );

      const infusionData = await contract.getTokenInfusionData(tokenId);

      res.json({
        success: true,
        tokenId,
        charms: infusionData.charms,
        upgrades: infusionData.upgrades.map(u => ({
          traitName: u.traitName,
          newValue: u.newValue,
          cost: ethers.formatEther(u.cost) + ' $NOM',
          appliedAt: new Date(parseInt(u.appliedAt.toString()) * 1000).toISOString()
        })),
        totalSpent: ethers.formatEther(infusionData.totalSpent) + ' $NOM',
        infusionScore: parseInt(infusionData.infusionScore.toString())
      });
    } catch (error) {
      console.error('Error fetching infusions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch infusion data'
      });
    }
  }

  /**
   * GET /api/infusions/user/:address
   * Get user's total infusion spending
   */
  static async getUserInfusionStats(req, res) {
    try {
      const { address } = req.params;

      if (!ethers.isAddress(address)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid address'
        });
      }

      const contract = new ethers.Contract(
        process.env.DRAGNINFUSIONS_ADDRESS,
        require('../../artifacts/contracts/DragNInfusions.sol/DragNInfusions.json').abi,
        new ethers.JsonRpcProvider(process.env.RPC_URL)
      );

      const totalSpent = await contract.getUserSpending(address);
      const nonce = await contract.getNonce(address);

      // Fetch from Firestore
      const userDocRef = db.collection('user_infusions').doc(address);
      const userDoc = await userDocRef.get();
      const userData = userDoc.data() || {};

      res.json({
        success: true,
        address,
        totalSpent: ethers.formatEther(totalSpent) + ' $NOM',
        totalSpentRaw: totalSpent.toString(),
        nonce: parseInt(nonce.toString()),
        charmsApplied: userData.charmsApplied || 0,
        upgradesApplied: userData.upgradesApplied || 0,
        favoriteCharms: userData.favoriteCharms || [],
        achievements: userData.achievements || []
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user statistics'
      });
    }
  }

  /**
   * POST /api/infusions/apply-charm
   * Apply a charm to a DragN
   */
  static async applyCharm(req, res) {
    try {
      const { tokenId, charmName, signature, deadline, userAddress } = req.body;

      if (!tokenId || !charmName || !userAddress) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters'
        });
      }

      const contract = new ethers.Contract(
        process.env.DRAGNINFUSIONS_ADDRESS,
        require('../../artifacts/contracts/DragNInfusions.sol/DragNInfusions.json').abi,
        new ethers.JsonRpcProvider(process.env.RPC_URL)
      );

      // Check if charm already applied
      const hasCharm = await contract.hasCharm(tokenId, charmName);
      if (hasCharm) {
        return res.status(400).json({
          success: false,
          error: 'Charm already applied to this DragN'
        });
      }

      // Get charm info
      const charmData = await contract.charms(charmName);
      if (!charmData.active) {
        return res.status(400).json({
          success: false,
          error: 'Charm is not available'
        });
      }

      // Store transaction for later processing
      const txRef = await db.collection('pending_infusions').add({
        type: 'apply_charm',
        tokenId: parseInt(tokenId),
        charmName,
        userAddress,
        cost: charmData.cost.toString(),
        signature,
        deadline: parseInt(deadline),
        createdAt: new Date(),
        status: 'pending'
      });

      res.json({
        success: true,
        message: 'Charm application queued',
        transactionId: txRef.id,
        charmName,
        tokenId: parseInt(tokenId),
        cost: ethers.formatEther(charmData.cost) + ' $NOM'
      });
    } catch (error) {
      console.error('Error applying charm:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to apply charm'
      });
    }
  }

  /**
   * POST /api/infusions/upgrade-trait
   * Upgrade a trait on a DragN
   */
  static async upgradeTrait(req, res) {
    try {
      const { tokenId, traitName, newValue, costMultiplier, userAddress } = req.body;

      if (!tokenId || !traitName || !newValue || !costMultiplier || !userAddress) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters'
        });
      }

      if (costMultiplier < 1 || costMultiplier > 5) {
        return res.status(400).json({
          success: false,
          error: 'Cost multiplier must be between 1 and 5'
        });
      }

      const contract = new ethers.Contract(
        process.env.DRAGNINFUSIONS_ADDRESS,
        require('../../artifacts/contracts/DragNInfusions.sol/DragNInfusions.json').abi,
        new ethers.JsonRpcProvider(process.env.RPC_URL)
      );

      // Calculate cost
      const baseCost = await contract.upgradeBaseCost();
      const totalCost = baseCost * BigInt(costMultiplier);

      // Store transaction
      const txRef = await db.collection('pending_infusions').add({
        type: 'upgrade_trait',
        tokenId: parseInt(tokenId),
        traitName,
        newValue,
        costMultiplier: parseInt(costMultiplier),
        userAddress,
        cost: totalCost.toString(),
        createdAt: new Date(),
        status: 'pending'
      });

      res.json({
        success: true,
        message: 'Trait upgrade queued',
        transactionId: txRef.id,
        traitName,
        newValue,
        tokenId: parseInt(tokenId),
        cost: ethers.formatEther(totalCost) + ' $NOM',
        costRaw: totalCost.toString()
      });
    } catch (error) {
      console.error('Error upgrading trait:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upgrade trait'
      });
    }
  }

  /**
   * GET /api/infusions/stats
   * Get global infusion statistics
   */
  static async getGlobalStats(req, res) {
    try {
      const contract = new ethers.Contract(
        process.env.DRAGNINFUSIONS_ADDRESS,
        require('../../artifacts/contracts/DragNInfusions.sol/DragNInfusions.json').abi,
        new ethers.JsonRpcProvider(process.env.RPC_URL)
      );

      const totalValue = await contract.totalInfusionValue();
      const allCharms = await contract.getAllCharms();
      const activeCharms = allCharms.filter(c => c.active);

      // Get Firestore stats
      const statsSnapshot = await db.collection('infusion_stats').limit(1).get();
      let stats = {};
      if (!statsSnapshot.empty) {
        stats = statsSnapshot.docs[0].data();
      }

      res.json({
        success: true,
        totalInfusionValue: ethers.formatEther(totalValue) + ' $NOM',
        totalInfusionValueRaw: totalValue.toString(),
        totalCharmsCreated: allCharms.length,
        activeCharms: activeCharms.length,
        averageCostPerCharm: activeCharms.length > 0 
          ? ethers.formatEther(
              activeCharms.reduce((sum, c) => sum + c.cost, 0n) / BigInt(activeCharms.length)
            ) + ' $NOM'
          : '0 $NOM',
        topCharmsByRarity: activeCharms
          .sort((a, b) => parseInt(b.rarity.toString()) - parseInt(a.rarity.toString()))
          .slice(0, 5)
          .map(c => ({
            name: c.name,
            rarity: parseInt(c.rarity.toString()),
            cost: ethers.formatEther(c.cost) + ' $NOM'
          })),
        playerEngagement: {
          uniquePlayers: stats.uniquePlayers || 0,
          totalCharmApplications: stats.totalCharmApplications || 0,
          totalTraitUpgrades: stats.totalTraitUpgrades || 0
        }
      });
    } catch (error) {
      console.error('Error fetching global stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }
  }

  /**
   * GET /api/infusions/leaderboard
   * Get top spenders on infusions
   */
  static async getLeaderboard(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;

      const leaderboardSnapshot = await db
        .collection('user_infusions')
        .orderBy('totalSpent', 'desc')
        .limit(limit)
        .get();

      const leaderboard = leaderboardSnapshot.docs.map((doc, index) => ({
        rank: index + 1,
        address: doc.id,
        totalSpent: ethers.formatEther(doc.data().totalSpent || 0) + ' $NOM',
        charmsApplied: doc.data().charmsApplied || 0,
        upgradesApplied: doc.data().upgradesApplied || 0,
        infusionScore: doc.data().infusionScore || 0
      }));

      res.json({
        success: true,
        leaderboard,
        count: leaderboard.length
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch leaderboard'
      });
    }
  }
}

/**
 * Helper function to get rarity label
 */
function getRarityLabel(rarity) {
  const labels = {
    1: 'Common',
    2: 'Uncommon',
    3: 'Rare',
    4: 'Epic',
    5: 'Legendary'
  };
  return labels[rarity] || 'Unknown';
}

module.exports = InfusionsController;
