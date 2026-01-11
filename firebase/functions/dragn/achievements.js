const { getFirestore } = require('firebase-admin/firestore');
const { log, error } = require('firebase-functions/logger');
const ethers = require('ethers');

const BADGE = {
  Unknown: 0,
  FirstMint: 1,
  TenFireBreaths: 2,
  SeasonTop10: 3,
};

function getSigner() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.API_URL_BASE);
  return new ethers.Wallet(process.env.BADGES_ADMIN_KEY, provider);
}

async function award(address, type) {
  try {
    const signer = getSigner();
    const abi = require('./abis/DragNBadges.json').abi;
    const contract = new ethers.Contract(process.env.DRAGNBADGES_CONTRACT, abi, signer);
    const tx = await contract.awardBadge(address, type);
    await tx.wait();
    log(`Badge awarded type ${type} to ${address}`);
    return true;
  } catch (err) {
    error('award badge error', err);
    return false;
  }
}

module.exports = {
  BADGE,
  award,
  async maybeAwardBreathFire10({ fid, address, progress }) {
    try {
      if (progress >= 10) {
        await award(address, BADGE.TenFireBreaths);
      }
    } catch (err) {
      error('maybeAwardBreathFire10', err);
    }
  },
  async awardFirstMint({ address }) {
    try {
      await award(address, BADGE.FirstMint);
    } catch (err) {
      error('awardFirstMint', err);
    }
  }
};
