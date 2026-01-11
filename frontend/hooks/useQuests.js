import { useCallback, useMemo, useState } from 'react';

const DEFAULT_BALANCES = { xp: 0, nom: 0 };

export default function useQuests() {
  const [quests, setQuests] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [context, setContext] = useState({ userId: null, address: null });

  const fetchQuests = useCallback(async ({ userId, address }) => {
    if (!userId) {
      setError('Missing userId / fid for quest lookup');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const url = `/api/quests/${userId}${address ? `?address=${encodeURIComponent(address)}` : ''}`;
      const resp = await fetch(url);
      const body = await resp.json();
      if (!body.success) throw new Error(body.error || 'Failed to fetch quests');
      setQuests(body.data);
      setContext({ userId, address });
      return body.data;
    } catch (err) {
      setError(err.message || 'Quest fetch failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const claimQuest = useCallback(async ({ userId, questId, address }) => {
    const targetUser = userId || context.userId;
    const targetAddress = address !== undefined ? address : context.address;
    if (!targetUser) {
      setError('Missing userId / fid for claim');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/quests/${targetUser}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId, address: targetAddress }),
      });
      const body = await resp.json();
      if (!body.success) throw new Error(body.error || 'Failed to claim quest');
      setQuests(body.data);
      setContext({ userId: targetUser, address: targetAddress });
      return body.data;
    } catch (err) {
      setError(err.message || 'Quest claim failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [context]);

  const claimAll = useCallback(async () => {
    if (!context.userId) {
      setError('Load quests before claiming');
      return null;
    }
    return claimQuest({ userId: context.userId, address: context.address });
  }, [claimQuest, context]);

  const claimableCount = useMemo(() => {
    return (quests?.quests || []).filter((q) => q.claimable).length;
  }, [quests]);

  const grouped = useMemo(() => {
    const buckets = { daily: [], weekly: [] };
    (quests?.quests || []).forEach((q) => {
      if (q.period === 'weekly') buckets.weekly.push(q); else buckets.daily.push(q);
    });
    return buckets;
  }, [quests]);

  const balances = quests?.balances || { ...DEFAULT_BALANCES };

  return {
    quests,
    loading,
    error,
    fetchQuests,
    claimQuest,
    claimAll,
    claimableCount,
    grouped,
    balances,
    context,
  };
}
