const { ethers } = require('ethers');

const ABI = require('../../artifacts/contracts/DragNBadges.sol/DragNBadges.json');

const BADGE = {
  Unknown: 0,
  FirstMint: 1,
  TenFireBreaths: 2,
  SeasonTop10: 3,
};

function getContract() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = process.env.BADGES_ADMIN_KEY ? new ethers.Wallet(process.env.BADGES_ADMIN_KEY, provider) : provider;
  return new ethers.Contract(process.env.DRAGNBADGES_ADDRESS, ABI.abi, signer);
}

class BadgesController {
  static async getTypes(req, res) {
    res.json({ success: true, types: BADGE });
  }

  static async getUserBadges(req, res) {
    try {
      const { address } = req.params;
      const contract = getContract();
      const out = [];
      for (const [name, val] of Object.entries(BADGE)) {
        if (val === BADGE.Unknown) continue;
        const has = await contract.hasBadge(address, val);
        if (has) out.push({ type: name, code: val });
      }
      res.json({ success: true, address, badges: out });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async award(req, res) {
    try {
      const { address, type } = req.body;
      if (!address || typeof type === 'undefined') return res.status(400).json({ success: false, error: 'address and type required' });
      const contract = getContract();
      const tx = await contract.awardBadge(address, type);
      const receipt = await tx.wait();
      res.json({ success: true, txHash: receipt.transactionHash });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = BadgesController;
