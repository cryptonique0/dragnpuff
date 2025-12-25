/**
 * House/Team Utility Functions
 */

const HOUSES = {
  0: "Aqua",
  1: "Fire",
  2: "Earth",
  3: "Air",
  4: "Light",
  5: "Dark",
  6: "Chaos",
};

/**
 * Get house name
 * @param {number} houseId - House ID
 * @returns {string}
 */
function getHouseName(houseId) {
  return HOUSES[houseId] || "Unknown";
}

/**
 * Create house object
 * @param {number} id - House ID
 * @param {object} data - House data
 * @returns {object}
 */
function createHouse(id, data = {}) {
  return {
    id,
    name: HOUSES[id],
    members: data.members || [],
    score: data.score || 0,
    rank: data.rank || null,
    createdAt: data.createdAt || Date.now(),
  };
}

/**
 * Add member to house
 * @param {object} house - House object
 * @param {object} member - Member data
 * @returns {object}
 */
function addMember(house, member) {
  return {
    ...house,
    members: [...house.members, member],
  };
}

/**
 * Calculate house strength
 * @param {object} house - House object
 * @returns {number}
 */
function calculateStrength(house) {
  return Math.floor(Math.sqrt(house.score * house.members.length)) * 10;
}

module.exports = {
  HOUSES,
  getHouseName,
  createHouse,
  addMember,
  calculateStrength,
};
