/**
 * Staking Model
 * Represents a user's staking position
 */

class StakingPosition {
  constructor(userId, data = {}) {
    this.userId = userId.toLowerCase();
    this.amount = data.amount || 0;
    this.lockedUntil = data.lockedUntil || 0;
    this.apy = data.apy || 0;
    this.rewardsEarned = data.rewardsEarned || 0;
    this.pendingRewards = data.pendingRewards || 0;
    this.stakedAt = data.stakedAt || new Date();
    this.lastClaimAt = data.lastClaimAt || null;
    this.tier = data.tier || 'bronze'; // bronze, silver, gold, platinum
  }

  static async findByUser(userId) {
    // TODO: Implement database lookup
    return new StakingPosition(userId);
  }

  static async create(userId, amount, lockPeriod) {
    const position = new StakingPosition(userId, {
      amount,
      lockedUntil: Date.now() + lockPeriod,
      apy: this.getAPY(amount),
      stakedAt: new Date()
    });
    // TODO: Save to database
    return position;
  }

  static getAPY(amount) {
    if (amount > 10000) return 15;
    if (amount > 5000) return 12;
    if (amount > 1000) return 10;
    return 8;
  }

  calculatePendingRewards() {
    const timeDiff = Date.now() - this.stakedAt.getTime();
    const daysStaked = timeDiff / (1000 * 60 * 60 * 24);
    this.pendingRewards = (this.amount * this.apy * daysStaked) / 365 / 100;
    return this.pendingRewards;
  }

  async claim() {
    const rewards = this.calculatePendingRewards();
    this.rewardsEarned += rewards;
    this.pendingRewards = 0;
    this.lastClaimAt = new Date();
    await this.save();
    return rewards;
  }

  async unstake() {
    if (Date.now() < this.lockedUntil) {
      throw new Error('Staking position is still locked');
    }
    // TODO: Process unstaking
    return this;
  }

  async save() {
    // TODO: Save to database
    return this;
  }

  toJSON() {
    return {
      userId: this.userId,
      amount: this.amount,
      apy: this.apy,
      rewardsEarned: this.rewardsEarned,
      pendingRewards: this.pendingRewards,
      stakedAt: this.stakedAt,
      lockedUntil: this.lockedUntil,
      tier: this.tier,
      canUnstake: Date.now() >= this.lockedUntil
    };
  }
}

module.exports = StakingPosition;
