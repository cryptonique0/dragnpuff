import React, { useState, useEffect } from 'react';
import { useInfusions } from '@/hooks/useInfusions';

export function InfusionFrame() {
  const {
    charms,
    userStats,
    dragNData,
    applyCharm,
    upgradeTrait,
    getDragNInfusions,
    getAvailableCharms,
    hasCharm,
    loading,
    error
  } = useInfusions();

  const [state, setState] = useState('browse'); // browse, select_dragn, select_charm, confirm, done
  const [selectedDragN, setSelectedDragN] = useState(null);
  const [selectedCharm, setSelectedCharm] = useState(null);
  const [userDragNs, setUserDragNs] = useState([]);
  const [loadingDragNs, setLoadingDragNs] = useState(false);

  useEffect(() => {
    getAvailableCharms();
  }, []);

  useEffect(() => {
    if (state === 'select_dragn') {
      fetchUserDragNs();
    }
  }, [state]);

  const fetchUserDragNs = async () => {
    setLoadingDragNs(true);
    try {
      const response = await fetch('/api/user/dragns');
      const data = await response.json();
      setUserDragNs(data.dragns || []);
    } catch (err) {
      console.error('Failed to fetch DragNs:', err);
    } finally {
      setLoadingDragNs(false);
    }
  };

  const handleCharmSelect = (charm) => {
    setSelectedCharm(charm);
    setState('select_dragn');
  };

  const handleDragNSelect = async (dragN) => {
    setSelectedDragN(dragN);
    await getDragNInfusions(dragN.tokenId);
    setState('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedCharm || !selectedDragN) return;

    try {
      // Here you would typically sign and send the transaction
      await applyCharm(selectedDragN.tokenId, selectedCharm.name, '', 0, '');
      setState('done');
    } catch (err) {
      console.error('Failed to apply charm:', err);
    }
  };

  const handleReset = () => {
    setSelectedCharm(null);
    setSelectedDragN(null);
    setState('browse');
  };

  return (
    <div className="infusion-frame">
      {state === 'browse' && (
        <BrowseCharms
          charms={charms}
          onSelectCharm={handleCharmSelect}
          loading={loading}
          error={error}
          userStats={userStats}
        />
      )}

      {state === 'select_dragn' && (
        <SelectDragN
          dragns={userDragNs}
          selectedCharm={selectedCharm}
          onSelectDragN={handleDragNSelect}
          onBack={() => setState('browse')}
          loading={loadingDragNs}
        />
      )}

      {state === 'confirm' && (
        <ConfirmInfusion
          dragN={selectedDragN}
          charm={selectedCharm}
          dragNData={dragNData[selectedDragN?.tokenId]}
          onConfirm={handleConfirm}
          onBack={() => setState('select_dragn')}
          loading={loading}
          hasCharm={hasCharm}
        />
      )}

      {state === 'done' && (
        <DoneState
          dragN={selectedDragN}
          charm={selectedCharm}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

function BrowseCharms({ charms, onSelectCharm, loading, error, userStats }) {
  if (loading) return <div className="state-loading">Loading charms...</div>;
  if (error) return <div className="state-error">Error: {error}</div>;

  return (
    <div className="state-browse">
      <h2>Infuse Your DragN</h2>
      <p>Apply enchanted charms and upgrades using $NOM</p>

      <div className="user-stats">
        <div className="stat">
          <span className="label">Total Spent</span>
          <span className="value">{userStats?.totalSpent || '0 $NOM'}</span>
        </div>
        <div className="stat">
          <span className="label">Charms Applied</span>
          <span className="value">{userStats?.charmsApplied || 0}</span>
        </div>
      </div>

      <div className="charms-grid">
        {charms.map(charm => (
          <div key={charm.name} className="charm-card">
            <div className="charm-header">
              <h3>{charm.name}</h3>
              <div className={`charm-rarity rarity-${charm.rarity}`}>
                {charm.rarity}★
              </div>
            </div>

            <p className="charm-description">{charm.description}</p>

            <div className="charm-cost">
              <span className="label">Cost</span>
              <span className="value">{charm.cost}</span>
            </div>

            <button
              onClick={() => onSelectCharm(charm)}
              className="select-button"
            >
              Infuse with {charm.name}
            </button>
          </div>
        ))}
      </div>

      <div className="info-box">
        <h4>About Infusions</h4>
        <ul>
          <li>Charms add unique properties to your DragN</li>
          <li>Each charm can only be applied once per DragN</li>
          <li>Rare charms provide greater benefits</li>
          <li>Mix and match different charms for synergies</li>
        </ul>
      </div>
    </div>
  );
}

function SelectDragN({ dragns, selectedCharm, onSelectDragN, onBack, loading }) {
  if (loading) return <div className="state-loading">Loading your DragNs...</div>;

  return (
    <div className="state-select">
      <div className="back-button" onClick={onBack}>← Back</div>

      <h2>Select a DragN</h2>
      <p>Choose which DragN to infuse with {selectedCharm?.name}</p>

      {dragns.length === 0 ? (
        <div className="no-dragns">
          <p>You don't have any DragNs yet.</p>
          <p>Mint one to get started!</p>
        </div>
      ) : (
        <div className="dragns-grid">
          {dragns.map(dragN => (
            <div
              key={dragN.tokenId}
              className="dragn-card"
              onClick={() => onSelectDragN(dragN)}
            >
              <img src={dragN.image} alt={`DragN #${dragN.tokenId}`} />
              <div className="dragn-info">
                <div className="dragn-number">#{dragN.tokenId}</div>
                {dragN.traits && (
                  <div className="dragn-traits">
                    {dragN.traits.slice(0, 2).map((trait, i) => (
                      <span key={i} className="trait-badge">{trait}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfirmInfusion({ dragN, charm, dragNData, onConfirm, onBack, loading, hasCharm }) {
  const dragNHasCharm = hasCharm(dragN?.tokenId, charm?.name);

  return (
    <div className="state-confirm">
      <div className="back-button" onClick={onBack}>← Back</div>

      <h2>Confirm Infusion</h2>

      {dragNHasCharm && (
        <div className="warning-box">
          ⚠️ This DragN already has the {charm?.name} charm
        </div>
      )}

      <div className="infusion-summary">
        <div className="dragn-preview">
          <img src={dragN?.image} alt={`DragN #${dragN?.tokenId}`} />
          <div className="dragn-id">DragN #{dragN?.tokenId}</div>
        </div>

        <div className="arrow">+</div>

        <div className="charm-preview">
          <div className={`charm-icon rarity-${charm?.rarity}`}>
            ✨
          </div>
          <div className="charm-name">{charm?.name}</div>
          <div className="charm-cost">{charm?.cost}</div>
        </div>
      </div>

      <div className="current-infusions">
        <h3>Current Infusions</h3>
        {dragNData?.charms && dragNData.charms.length > 0 ? (
          <ul>
            {dragNData.charms.map(c => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        ) : (
          <p>No charms applied yet</p>
        )}
      </div>

      <div className="stats">
        <div className="stat-row">
          <span>Infusion Score</span>
          <strong>{dragNData?.infusionScore || 0}</strong>
        </div>
        <div className="stat-row">
          <span>Total Spent</span>
          <strong>{dragNData?.totalSpent || '0 $NOM'}</strong>
        </div>
      </div>

      <button
        onClick={onConfirm}
        disabled={loading || dragNHasCharm}
        className="confirm-button"
      >
        {loading ? 'Infusing...' : 'Confirm Infusion'}
      </button>
    </div>
  );
}

function DoneState({ dragN, charm, onReset }) {
  return (
    <div className="state-done">
      <div className="success-message">
        <div className="success-icon">✨</div>
        <h2>Infusion Complete!</h2>
      </div>

      <div className="infusion-result">
        <p>
          DragN #{dragN?.tokenId} has been infused with <strong>{charm?.name}</strong>
        </p>
        <p className="subtitle">Your DragN is now more powerful!</p>
      </div>

      <button
        onClick={onReset}
        className="infuse-another-button"
      >
        Infuse Another DragN
      </button>
    </div>
  );
}

export default InfusionFrame;
