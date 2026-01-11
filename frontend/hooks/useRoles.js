// React Hook for House Roles & Loadouts

import { useState, useEffect, useCallback } from 'react';

export function useRoles(userId) {
  const [loadout, setLoadout] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available roles
  const fetchAvailableRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/roles/available');
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(data.availableRoles);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching roles:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user's loadout
  const fetchUserLoadout = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/roles/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch loadout');
      const data = await response.json();
      setLoadout(data.dragns);
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching loadout:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Get role for a specific DragN
  const getDragNRole = useCallback(async (tokenId) => {
    try {
      const response = await fetch(`/api/roles/dragn/${tokenId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.error('Error fetching DragN role:', err);
      return null;
    }
  }, []);

  // Assign role to a DragN
  const assignRole = useCallback(async (tokenId, roleId, houseId) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/roles/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, roleId, houseId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign role');
      }
      
      const data = await response.json();
      
      // Update local state
      const updatedLoadout = loadout.map(d =>
        d.tokenId === tokenId ? { ...d, roleId, role: data.role, modifiers: data.modifiers } : d
      );
      setLoadout(updatedLoadout);
      
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error assigning role:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadout]);

  // Update user's loadout
  const updateLoadout = useCallback(async (tokenIds) => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/roles/user/${userId}/loadout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenIds })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update loadout');
      }
      
      const data = await response.json();
      
      // Refetch loadout to get updated data
      await fetchUserLoadout();
      
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error updating loadout:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchUserLoadout]);

  // Get role statistics
  const getRoleStats = useCallback(async () => {
    try {
      const response = await fetch('/api/roles/stats');
      if (!response.ok) throw new Error('Failed to fetch role stats');
      return await response.json();
    } catch (err) {
      console.error('Error fetching role stats:', err);
      return null;
    }
  }, []);

  // Initialize
  useEffect(() => {
    fetchAvailableRoles();
    if (userId) {
      fetchUserLoadout();
    }
  }, [userId, fetchAvailableRoles, fetchUserLoadout]);

  // Get role by ID
  const getRoleById = useCallback((roleId) => {
    return roles.find(r => r.id === roleId);
  }, [roles]);

  // Get loadout summary
  const getLoadoutSummary = useCallback(() => {
    if (!loadout.length) {
      return {
        dragnsActive: 0,
        avgAttack: 0,
        avgDefense: 0,
        avgRecruit: 0,
        roles: []
      };
    }

    const roleCounts = {};
    let totalAttack = 0;
    let totalDefense = 0;
    let totalRecruit = 0;

    loadout.forEach(dragn => {
      roleCounts[dragn.role] = (roleCounts[dragn.role] || 0) + 1;
      totalAttack += dragn.modifiers.attackMultiplier || 1.0;
      totalDefense += dragn.modifiers.defenseMultiplier || 1.0;
      totalRecruit += dragn.modifiers.recruitMultiplier || 1.0;
    });

    return {
      dragnsActive: loadout.length,
      avgAttack: (totalAttack / loadout.length).toFixed(2),
      avgDefense: (totalDefense / loadout.length).toFixed(2),
      avgRecruit: (totalRecruit / loadout.length).toFixed(2),
      roles: Object.entries(roleCounts).map(([role, count]) => ({
        role,
        count
      }))
    };
  }, [loadout]);

  return {
    loadout,
    roles,
    stats,
    isLoading,
    error,
    fetchUserLoadout,
    getDragNRole,
    assignRole,
    updateLoadout,
    getRoleStats,
    getRoleById,
    getLoadoutSummary,
    clearError: () => setError(null)
  };
}
