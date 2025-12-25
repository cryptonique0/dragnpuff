/**
 * Reward Calculation Utilities
 */

/**
 * Calculate reward for action
 * @param {string} action - Action type
 * @param {object} params - Additional parameters
 * @returns {number}
 */
function calculateReward(action, params = {}) {
  const baseRewards = {
    mint: 10,
    choose: 5,
    breathe_fire: 15,
    cast: 3,
    reaction: 1,
  };

  let reward = baseRewards[action] || 0;

  // Apply multipliers
  if (params.multiplier) {
    reward *= params.multiplier;
  }

  // Apply bonuses
  if (params.bonus) {
    reward += params.bonus;
  }

  return Math.round(reward);
}

/**
 * Calculate cumulative rewards
 * @param {array} actions - Array of action records
 * @returns {number}
 */
function calculateCumulativeRewards(actions) {
  return actions.reduce((sum, action) => {
    return sum + calculateReward(action.type, action.params);
  }, 0);
}

/**
 * Calculate distribution rewards among house members
 * @param {number} totalReward - Total reward to distribute
 * @param {array} members - Array of member scores
 * @returns {object}
 */
function distributeRewards(totalReward, members) {
  const totalScore = members.reduce((sum, m) => sum + m.score, 0);
  const distribution = {};

  members.forEach((member) => {
    distribution[member.id] = Math.round((totalReward * member.score) / totalScore);
  });

  return distribution;
}

module.exports = {
  calculateReward,
  calculateCumulativeRewards,
  distributeRewards,
};
