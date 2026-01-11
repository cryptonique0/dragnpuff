import React, { useEffect, useMemo, useState } from 'react';
import useQuests from '../hooks/useQuests';
import '../styles/global.css';
import './QuestBoard.css';

export default function QuestBoard({ initialFid = '', address }) {
  const { quests, loading, error, fetchQuests, claimQuest, claimAll, claimableCount, grouped, balances } = useQuests();
  const [fid, setFid] = useState(initialFid);

  useEffect(() => {
    if (initialFid) {
      fetchQuests({ userId: initialFid, address }).catch(() => {});
    }
  }, [initialFid, address, fetchQuests]);

  const onLoad = () => {
    if (!fid) return;
    fetchQuests({ userId: fid, address }).catch(() => {});
  };

  const onClaimAll = () => {
    if (!fid) return;
    claimAll().catch(() => {});
  };

  const progressBuckets = useMemo(() => grouped, [grouped]);

  return (
    <div className="quest-board">
      <div className="quest-board__header">
        <div>
          <p className="helper-text">Daily + weekly quests</p>
          <h2>Quest Board</h2>
          <p>Use your Farcaster fid to pull quest progress. Connect a wallet to link address rewards.</p>
        </div>
        <div className="quest-board__controls">
          <label className="quest-board__label">Farcaster fid</label>
          <div className="quest-board__input-row">
            <input
              type="text"
              placeholder="Enter fid (e.g. 1234)"
              value={fid}
              onChange={(e) => setFid(e.target.value)}
            />
            <button className="btn btn-primary" onClick={onLoad} disabled={!fid || loading}>
              {loading ? 'Loading…' : 'Load'}
            </button>
            <button className="btn btn-secondary" onClick={onClaimAll} disabled={!fid || loading || !claimableCount}>
              {claimableCount ? `Claim ${claimableCount}` : 'Claim'}
            </button>
          </div>
          {address && <div className="helper-text">Linked wallet: {address}</div>}
          {quests && (
            <div className="quest-board__balances">
              <span>XP: {balances.xp || 0}</span>
              <span>NOM: {balances.nom || 0}</span>
              <span>Claimable: {claimableCount}</span>
            </div>
          )}
          {error && <div className="quest-board__error">{error}</div>}
        </div>
      </div>

      <div className="quest-board__content">
        <QuestColumn
          title="Daily Quests"
          quests={progressBuckets.daily}
          loading={loading}
          onClaim={(id) => claimQuest({ userId: fid, questId: id, address }).catch(() => {})}
        />
        <QuestColumn
          title="Weekly Quests"
          quests={progressBuckets.weekly}
          loading={loading}
          onClaim={(id) => claimQuest({ userId: fid, questId: id, address }).catch(() => {})}
        />
      </div>

      {!loading && quests && quests.quests?.length === 0 && (
        <div className="quest-board__empty">No quests yet. Refresh to sync definitions.</div>
      )}
    </div>
  );
}

function QuestColumn({ title, quests, loading, onClaim }) {
  return (
    <div className="quest-column">
      <div className="quest-column__title">{title}</div>
      {loading && <div className="quest-loading">Loading quests…</div>}
      {!loading && (!quests || quests.length === 0) && (
        <div className="quest-empty">No quests tracked yet.</div>
      )}
      {quests?.map((quest) => (
        <QuestCard key={quest.id} quest={quest} onClaim={onClaim} />
      ))}
    </div>
  );
}

function QuestCard({ quest, onClaim }) {
  const pct = Math.min(100, Math.round((quest.progress / quest.goal) * 100));
  return (
    <div className={`quest-card ${quest.claimed ? 'quest-card--claimed' : ''} ${quest.claimable ? 'quest-card--ready' : ''}`}>
      <div className="quest-card__header">
        <div>
          <div className="quest-card__title">{quest.title}</div>
          <div className="quest-card__description">{quest.description}</div>
        </div>
        <div className="quest-card__reward">{quest.reward?.amount} {quest.reward?.type?.toUpperCase()}</div>
      </div>
      <div className="quest-card__progress">
        <div className="quest-card__progress-bar">
          <div className="quest-card__progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="quest-card__progress-text">{quest.progress}/{quest.goal}</div>
      </div>
      <div className="quest-card__footer">
        <div className="quest-card__status">
          {quest.claimed ? 'Claimed' : quest.claimable ? 'Ready to claim' : `${quest.remaining} remaining`}
        </div>
        <button
          className="btn btn-secondary"
          disabled={!quest.claimable}
          onClick={() => onClaim(quest.id)}
        >
          {quest.claimed ? 'Claimed' : 'Claim'}
        </button>
      </div>
    </div>
  );
}
