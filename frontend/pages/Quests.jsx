import React from 'react';
import QuestBoard from '../components/QuestBoard';
import { useWallet } from '../hooks/useWallet';

export default function QuestsPage() {
  const { address, isConnected, connect } = useWallet();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
      <QuestBoard initialFid="" address={isConnected ? address : null} />
      {!isConnected && (
        <div style={{ marginTop: '12px' }}>
          <button className="btn btn-primary" onClick={connect}>Connect wallet to sync address</button>
        </div>
      )}
    </div>
  );
}
