/**
 * Leaderboard Calculation Functions
 */

/**
 * Calculate house score
 * @param {array} members - Array of member scores
 * @returns {number}
 */
function calculateHouseScore(members) {
  return members.reduce((sum, member) => sum + member.score, 0);
}

/**
 * Calculate member rank within house
 * @param {array} members - Array of members with scores
 * @param {string} memberId - Member ID to rank
 * @returns {number}
 */
function calculateMemberRank(members, memberId) {
  const sorted = [...members].sort((a, b) => b.score - a.score);
  return sorted.findIndex((m) => m.id === memberId) + 1;
}

/**
 * Calculate house rank
 * @param {array} houses - Array of houses with scores
 * @param {number} houseId - House ID
 * @returns {number}
 */
function calculateHouseRank(houses, houseId) {
  const sorted = [...houses].sort((a, b) => b.score - a.score);
  return sorted.findIndex((h) => h.id === houseId) + 1;
}

/**
 * Calculate leaderboard
 * @param {array} houses - Array of houses
 * @returns {array}
 */
function calculateLeaderboard(houses) {
  return houses
    .map((house) => ({
      ...house,
      rank: 0,
    }))
    .sort((a, b) => b.score - a.score)
    .map((house, idx) => ({
      ...house,
      rank: idx + 1,
    }));
}

module.exports = {
  calculateHouseScore,
  calculateMemberRank,
  calculateHouseRank,
  calculateLeaderboard,
};
