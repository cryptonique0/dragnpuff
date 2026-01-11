import React, { useEffect } from 'react';
import useReferrals from '../hooks/useReferrals';

export default function SquadView({ referrerFid }) {
  const { loading, error, squad, getSquad } = useReferrals();

  useEffect(() => { if (referrerFid) getSquad(referrerFid); }, [referrerFid, getSquad]);

  if (!referrerFid) return <div>Select a squad leader</div>;
  if (loading) return <div>Loading squad…</div>;
  if (error) return <div>Error: {error}</div>;
  if (!squad) return <div>No squad data</div>;

  return (
    <div className="squad-view">
      <h3>Squad of {squad.referrerFid}</h3>
      <section>
        <strong>Members:</strong>
        {squad.members && squad.members.length ? (
          <ul>
            {squad.members.map((m) => (<li key={m}>FID {m}</li>))}
          </ul>
        ) : (
          <p>No recruits yet.</p>
        )}
      </section>
      <section>
        <strong>Buffs:</strong>
        {squad.buffs && squad.buffs.length ? (
          <ul>
            {squad.buffs.map((b, idx) => (<li key={idx}>{b.type} +{b.amount || ''} {b.unit || ''}</li>))}
          </ul>
        ) : (
          <p>No buffs yet.</p>
        )}
      </section>
      <section>
        <strong>Loot:</strong>
        {squad.loot && squad.loot.length ? (
          <ul>
            {squad.loot.map((l, idx) => (<li key={idx}>{l.type}</li>))}
          </ul>
        ) : (
          <p>No loot yet.</p>
        )}
      </section>
    </div>
  );
}
