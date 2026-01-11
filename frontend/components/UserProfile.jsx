import React, { useState } from 'react';
import BadgesPanel from './BadgesPanel';
import SquadView from './SquadView';

export default function UserProfile() {
  const [address, setAddress] = useState('');
  const [fid, setFid] = useState('');

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <div className="profile-inputs">
        <label>
          Wallet Address
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..." />
        </label>
        <label>
          Farcaster FID
          <input value={fid} onChange={(e) => setFid(e.target.value)} placeholder="12345" />
        </label>
      </div>

      <div className="profile-sections">
        <div>
          <h3>Badges</h3>
          <BadgesPanel address={address} />
        </div>
        <div>
          <h3>Squad</h3>
          <SquadView referrerFid={fid} />
        </div>
      </div>
    </div>
  );
}
