import { useState, useCallback } from 'react';

export default function useBadges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUserBadges = useCallback(async (address) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/badges/user/${address}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      setBadges(json.badges || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { badges, loading, error, getUserBadges };
}
