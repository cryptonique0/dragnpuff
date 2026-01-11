/**
 * Seasonal Wars Configuration
 * Update these values to configure seasonal competition parameters
 */

module.exports = {
  // Contract configuration
  contract: {
    // Set after deployment
    address: process.env.SEASONAL_WARS_CONTRACT || "",
    
    // Network
    network: process.env.NETWORK || "base",
  },

  // Season parameters
  season: {
    // Default duration in days
    defaultDuration: 30,
    
    // Minimum duration (1 week)
    minDuration: 7,
    
    // Maximum duration (90 days)
    maxDuration: 90,
  },

  // Scoring configuration
  scoring: {
    // Action point values
    actions: {
      BREATHE_FIRE: 15,
      FLEX_HOUSE: 5,
      RECRUIT: 10,
      CAST_ENGAGEMENT: 3,
    },
    
    // Multiplier limits
    multiplier: {
      min: 0.5,    // 50% (0.5x)
      max: 5.0,    // 500% (5x)
      default: 1.0, // 100% (1x)
    },
  },

  // Prize pool configuration
  prizes: {
    // Default distribution (basis points, must sum to 10000)
    distribution: [5000, 3000, 2000], // 50%, 30%, 20%
    
    // Minimum prize pool to display (in ETH)
    minDisplayAmount: 0.1,
    
    // Treasury address for unclaimed prizes
    treasuryAddress: process.env.TREASURY_ADDRESS || "",
  },

  // Leaderboard display
  leaderboard: {
    // Number of houses to show
    displayCount: 7,
    
    // Update frequency in milliseconds
    updateInterval: 60000, // 1 minute
    
    // Cache TTL in seconds
    cacheTTL: 300, // 5 minutes
  },

  // Special events and bonuses
  events: {
    // Enable special event multipliers
    enabled: true,
    
    // Example event configurations
    types: {
      WEEKEND_WARRIOR: {
        multiplier: 1.5,
        description: "Weekend bonus points",
        schedule: "weekends",
      },
      COMEBACK_BONUS: {
        multiplier: 2.0,
        description: "Bonus for houses in last place",
        condition: "last_place",
      },
      MILESTONE_REWARD: {
        multiplier: 1.25,
        description: "Bonus when house reaches milestone",
        condition: "milestone",
      },
    },
  },

  // Notifications
  notifications: {
    // Discord webhook for season events
    discordWebhook: process.env.DISCORD_WEBHOOK || "",
    
    // Enable notifications
    enabled: true,
    
    // Events to notify about
    events: [
      "season_start",
      "season_end",
      "leaderboard_change",
      "prize_added",
      "milestone_reached",
    ],
  },

  // Analytics
  analytics: {
    // Track detailed metrics
    enabled: true,
    
    // Metrics to track
    metrics: [
      "daily_scores",
      "action_frequency",
      "player_retention",
      "house_momentum",
    ],
  },

  // API rate limiting
  rateLimit: {
    // Requests per minute
    requestsPerMinute: 60,
    
    // Burst allowance
    burst: 100,
  },

  // Feature flags
  features: {
    // Enable multiplier system
    multipliers: true,
    
    // Enable prize pools
    prizes: true,
    
    // Enable special events
    specialEvents: true,
    
    // Enable real-time updates
    realTimeUpdates: true,
  },
};
