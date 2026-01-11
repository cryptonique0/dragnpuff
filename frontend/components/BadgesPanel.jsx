import React, { useEffect } from 'react';
import useBadges from '../hooks/useBadges';

export default function BadgesPanel({ address }) {
  const { badges, loading, error, getUserBadges } = useBadges();

  useEffect(() => { if (address) getUserBadges(address); }, [address, getUserBadges]);

  if (!address) return <div>Connect wallet to view badges</div>;
  if (loading) return <div>Loading badges…</div>;
  if (error) return <div>Error: {error}</div>;

  if (!badges || !badges.length) return <div>No badges yet. Keep playing!</div>;

  return (
    <div className="badges-panel">
      <h3>Your Badges</h3>
      <ul>
        {badges.map((b, idx) => (
          <li key={idx}>
            <span className="badge-name">{b.type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
