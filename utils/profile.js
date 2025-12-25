/**
 * User Profile Utilities
 */

/**
 * Create user profile object
 * @param {object} data - Profile data
 * @returns {object}
 */
function createProfile(data) {
  return {
    address: data.address,
    farcasterFid: data.farcasterFid || null,
    username: data.username || null,
    nfts: data.nfts || [],
    houseId: data.houseId || null,
    score: data.score || 0,
    joinedAt: data.joinedAt || Date.now(),
    lastActive: data.lastActive || Date.now(),
    stats: {
      mintsCount: data.stats?.mintsCount || 0,
      actionsCount: data.stats?.actionsCount || 0,
      interactions: data.stats?.interactions || 0,
    },
  };
}

/**
 * Update profile activity
 * @param {object} profile - Profile object
 * @returns {object}
 */
function updateActivity(profile) {
  return {
    ...profile,
    lastActive: Date.now(),
  };
}

/**
 * Add score to profile
 * @param {object} profile - Profile object
 * @param {number} points - Points to add
 * @returns {object}
 */
function addScore(profile, points) {
  return {
    ...profile,
    score: profile.score + points,
  };
}

module.exports = {
  createProfile,
  updateActivity,
  addScore,
};
