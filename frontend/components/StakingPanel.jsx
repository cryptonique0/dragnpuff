/**
 * StakingPanel Component
 * Displays staking information and controls
 */

import React, { useState, useEffect } from 'react';
import './StakingPanel.css';

const StakingPanel = ({ userAddress, onStake, onUnstake, onClaim }) => {
  const [stakingData, setStakingData] = useState({
    amount: 0,
    apy: 0,
    pendingRewards: 0,
    lockedUntil: 0
  });
  const [stakeAmount, setStakeAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState(30);

  useEffect(() => {
    // TODO: Fetch staking data from API
    setStakingData({
      amount: 5000,
      apy: 12,
      pendingRewards: 45.5,
      lockedUntil: Date.now() + 30 * 24 * 60 * 60 * 1000
    });
  }, [userAddress]);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    await onStake(stakeAmount, lockPeriod);
    setStakeAmount('');
  };

  const canUnstake = Date.now() >= stakingData.lockedUntil;

  return (
    <div className="staking-panel">
      <h2>Token Staking</h2>

      <div className="staking-stats">
        <div className="stat-box">
          <span className="label">Staked Amount</span>
          <span className="value">{stakingData.amount} FAIR</span>
        </div>
        <div className="stat-box">
          <span className="label">APY</span>
          <span className="value">{stakingData.apy}%</span>
        </div>
        <div className="stat-box">
          <span className="label">Pending Rewards</span>
          <span className="value">{stakingData.pendingRewards.toFixed(2)} FAIR</span>
        </div>
      </div>

      {stakingData.amount > 0 ? (
        <div className="staking-actions">
          <button 
            className="btn btn-success" 
            onClick={() => onClaim(stakingData.pendingRewards)}
            disabled={stakingData.pendingRewards === 0}
          >
            Claim Rewards
          </button>
          <button 
            className="btn btn-danger" 
            onClick={() => onUnstake()}
            disabled={!canUnstake}
          >
            {canUnstake ? 'Unstake' : `Locked until ${new Date(stakingData.lockedUntil).toLocaleDateString()}`}
          </button>
        </div>
      ) : (
        <div className="staking-form">
          <h3>Start Staking</h3>
          <input
            type="number"
            placeholder="Amount to stake"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          <select value={lockPeriod} onChange={(e) => setLockPeriod(parseInt(e.target.value))}>
            <option value={30}>30 Days - 8% APY</option>
            <option value={90}>90 Days - 10% APY</option>
            <option value={180}>180 Days - 12% APY</option>
            <option value={365}>1 Year - 15% APY</option>
          </select>
          <button className="btn btn-primary" onClick={handleStake}>
            Stake Now
          </button>
        </div>
      )}
    </div>
  );
};

export default StakingPanel;
