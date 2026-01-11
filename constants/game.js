/**
 * Game Configuration Constants
 */

module.exports = {
  // Houses
  HOUSES: {
    AQUA: 0,
    FIRE: 1,
    EARTH: 2,
    AIR: 3,
    LIGHT: 4,
    DARK: 5,
    CHAOS: 6,
  },

  HOUSE_NAMES: {
    0: "Aqua",
    1: "Fire",
    2: "Earth",
    3: "Air",
    4: "Light",
    5: "Dark",
    6: "Chaos",
  },

  // Game Phases
  PHASES: {
    MINT: "mint",
    CHOOSE: "choose",
    ACTIVE: "active",
    CLOSED: "closed",
  },

  // Scoring
  SCORES: {
    MINT: 10,
    CHOOSE: 5,
    BREATHE_FIRE: 15,
    CAST: 3,
    REACTION: 1,
  },

  // Seasonal Wars
  SEASON_DURATION: 30 * 24 * 60 * 60, // 30 days in seconds
  SEASON_SCORE_ACTIONS: {
    BREATHE_FIRE: 15,
    FLEX_HOUSE: 5,
    RECRUIT: 10,
    CAST_ENGAGEMENT: 3,
  },
  SEASON_MULTIPLIER_MAX: 5.0,
  SEASON_PRIZE_DISTRIBUTION: [50, 30, 20], // Top 3: 50%, 30%, 20%

  // Leaderboard
  LEADERBOARD_SIZE: 7,
  LEADERBOARD_UPDATE_INTERVAL: 60000, // 1 minute

  // Traits
  TRAIT_CATEGORIES: 7,
  TOTAL_TRAITS: 111,

  // Time Limits
  MINT_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  CHOOSE_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days
};
