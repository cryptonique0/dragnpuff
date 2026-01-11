import { useState, useCallback } from 'react';

export default function useReferrals(baseUrl = '/api/referrals') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [squad, setSquad] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [leaders, setLeaders] = useState([]);

  const getSquad = useCallback(async (referrerFid) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${baseUrl}/squad/${referrerFid}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to fetch squad');
      setSquad(json.data);
      return json.data;
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [baseUrl]);

  const getUserReferrals = useCallback(async (fid) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${baseUrl}/user/${fid}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to fetch user referrals');
      setUserStats(json.data);
      return json.data;
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [baseUrl]);

  const getLeaderboard = useCallback(async (limit = 10) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${baseUrl}/leaderboard?limit=${limit}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to fetch leaderboard');
      setLeaders(json.leaders);
      return json.leaders;
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [baseUrl]);

  const submitReferral = useCallback(async (payload) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${baseUrl}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to submit referral');
      return json.proofId;
    } catch (err) { setError(err.message); return null; }
    finally { setLoading(false); }
  }, [baseUrl]);

  const redeem = useCallback(async ({ fid, type }) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${baseUrl}/redeem`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fid, type })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to redeem');
      return true;
    } catch (err) { setError(err.message); return false; }
    finally { setLoading(false); }
  }, [baseUrl]);

  return { loading, error, squad, userStats, leaders, getSquad, getUserReferrals, getLeaderboard, submitReferral, redeem };
}
