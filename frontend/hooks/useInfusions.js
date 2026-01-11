import { useState, useCallback, useEffect } from 'react';

/**
 * useInfusions Hook
 * Manages DragN infusion state (charms, upgrades, spending)
 */
export function useInfusions() {
  const [charms, setCharms] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [dragNData, setDragNData] = useState({});
  const [globalStats, setGlobalStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all available charms
   */
  const getAvailableCharms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/infusions/charms');
      const data = await response.json();

      if (data.success) {
        setCharms(data.charms);
        return data.charms;
      } else {
        throw new Error(data.error || 'Failed to fetch charms');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching charms:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch infusion data for a specific DragN
   */
  const getDragNInfusions = useCallback(async (tokenId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/infusions/dragn/${tokenId}`);
      const data = await response.json();

      if (data.success) {
        setDragNData(prev => ({
          ...prev,
          [tokenId]: data
        }));
        return data;
      } else {
        throw new Error(data.error || 'Failed to fetch infusion data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching DragN infusions:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch user infusion statistics
   */
  const getUserInfusionStats = useCallback(async (address) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/infusions/user/${address}`);
      const data = await response.json();

      if (data.success) {
        setUserStats(data);
        return data;
      } else {
        throw new Error(data.error || 'Failed to fetch user stats');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Apply a charm to a DragN
   */
  const applyCharm = useCallback(async (tokenId, charmName, signature, deadline, userAddress) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/infusions/apply-charm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tokenId,
          charmName,
          signature,
          deadline,
          userAddress
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh DragN data
        await getDragNInfusions(tokenId);
        return data;
      } else {
        throw new Error(data.error || 'Failed to apply charm');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error applying charm:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getDragNInfusions]);

  /**
   * Upgrade a trait on a DragN
   */
  const upgradeTrait = useCallback(async (tokenId, traitName, newValue, costMultiplier, userAddress) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/infusions/upgrade-trait', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tokenId,
          traitName,
          newValue,
          costMultiplier: parseInt(costMultiplier),
          userAddress
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh DragN data
        await getDragNInfusions(tokenId);
        return data;
      } else {
        throw new Error(data.error || 'Failed to upgrade trait');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error upgrading trait:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getDragNInfusions]);

  /**
   * Fetch global infusion statistics
   */
  const getGlobalStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/infusions/stats');
      const data = await response.json();

      if (data.success) {
        setGlobalStats(data);
        return data;
      } else {
        throw new Error(data.error || 'Failed to fetch stats');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching global stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch leaderboard
   */
  const getLeaderboard = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/infusions/leaderboard?limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
        return data.leaderboard;
      } else {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching leaderboard:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get specific charm data
   */
  const getCharmData = useCallback((charmName) => {
    return charms.find(c => c.name === charmName) || null;
  }, [charms]);

  /**
   * Get DragN infusion data
   */
  const getDragNData = useCallback((tokenId) => {
    return dragNData[tokenId] || null;
  }, [dragNData]);

  /**
   * Check if DragN has a specific charm
   */
  const hasCharm = useCallback((tokenId, charmName) => {
    const data = dragNData[tokenId];
    return data ? data.charms.includes(charmName) : false;
  }, [dragNData]);

  /**
   * Get user's favorite charms
   */
  const getUserFavoriteCharms = useCallback(() => {
    return userStats?.favoriteCharms || [];
  }, [userStats]);

  /**
   * Get user's achievements
   */
  const getUserAchievements = useCallback(() => {
    return userStats?.achievements || [];
  }, [userStats]);

  /**
   * Calculate infusion cost breakdown
   */
  const calculateInfusionCost = useCallback((charmName, costMultiplier = 1) => {
    const charm = getCharmData(charmName);
    if (!charm) return null;

    const baseCost = parseFloat(charm.cost);
    const totalCost = baseCost * costMultiplier;

    return {
      baseCost: charm.cost,
      multiplier: costMultiplier,
      totalCost: totalCost.toFixed(2) + ' $NOM',
      rarity: charm.rarity,
      rarityLabel: getRarityLabel(charm.rarity)
    };
  }, [getCharmData]);

  /**
   * Refresh all user data
   */
  const refreshUserData = useCallback(async (address) => {
    if (!address) return;
    await Promise.all([
      getAvailableCharms(),
      getUserInfusionStats(address),
      getGlobalStats(),
      getLeaderboard()
    ]);
  }, [getAvailableCharms, getUserInfusionStats, getGlobalStats, getLeaderboard]);

  return {
    // State
    charms,
    userStats,
    dragNData,
    globalStats,
    leaderboard,
    loading,
    error,

    // Fetching functions
    getAvailableCharms,
    getDragNInfusions,
    getUserInfusionStats,
    getGlobalStats,
    getLeaderboard,

    // Action functions
    applyCharm,
    upgradeTrait,

    // Query functions
    getCharmData,
    getDragNData,
    hasCharm,
    getUserFavoriteCharms,
    getUserAchievements,
    calculateInfusionCost,

    // Utility functions
    refreshUserData
  };
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

export default useInfusions;
