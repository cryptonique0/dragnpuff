/**
 * GovernancePanel Component
 * Displays governance proposals and voting interface
 */

import React, { useState, useEffect } from 'react';
import './GovernancePanel.css';

const GovernancePanel = ({ userAddress }) => {
  const [proposals, setProposals] = useState([]);
  const [voting, setVoting] = useState({});
  const [creating, setCreating] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    target: ''
  });

  useEffect(() => {
    // TODO: Fetch proposals from API
    setProposals([
      {
        id: 1,
        title: 'Increase Staking APY',
        description: 'Proposal to increase staking rewards from 15% to 18%',
        status: 'active',
        forVotes: 1200,
        againstVotes: 300,
        votingEnds: Date.now() + 3 * 24 * 60 * 60 * 1000,
        userVoted: false
      },
      {
        id: 2,
        title: 'New Marketplace Features',
        description: 'Enable batch listing and advanced filtering',
        status: 'active',
        forVotes: 950,
        againstVotes: 150,
        votingEnds: Date.now() + 5 * 24 * 60 * 60 * 1000,
        userVoted: false
      }
    ]);
  }, []);

  const handleVote = (proposalId, vote) => {
    setVoting({ ...voting, [proposalId]: vote });
    // TODO: Execute vote transaction
    console.log(`Voted ${vote} on proposal ${proposalId}`);
  };

  const handleCreateProposal = async () => {
    if (!newProposal.title || !newProposal.description) {
      alert('Please fill in all fields');
      return;
    }
    // TODO: Create proposal on contract
    setCreating(false);
    setNewProposal({ title: '', description: '', target: '' });
  };

  return (
    <div className="governance-panel">
      <h2>Governance</h2>

      {creating ? (
        <div className="create-proposal-form">
          <h3>Create New Proposal</h3>
          <input
            type="text"
            placeholder="Proposal Title"
            value={newProposal.title}
            onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
          />
          <textarea
            placeholder="Proposal Description"
            value={newProposal.description}
            onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
            rows="4"
          />
          <input
            type="text"
            placeholder="Target Address (optional)"
            value={newProposal.target}
            onChange={(e) => setNewProposal({ ...newProposal, target: e.target.value })}
          />
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleCreateProposal}>
              Create Proposal
            </button>
            <button className="btn btn-secondary" onClick={() => setCreating(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          Create Proposal
        </button>
      )}

      <div className="proposals-list">
        {proposals.map(proposal => (
          <div key={proposal.id} className="proposal-card">
            <h4>{proposal.title}</h4>
            <p>{proposal.description}</p>

            <div className="proposal-stats">
              <div className="stat">
                <span className="label">For Votes</span>
                <span className="value">{proposal.forVotes}</span>
              </div>
              <div className="stat">
                <span className="label">Against Votes</span>
                <span className="value">{proposal.againstVotes}</span>
              </div>
              <div className="stat">
                <span className="label">Status</span>
                <span className="badge">{proposal.status}</span>
              </div>
            </div>

            <div className="voting-bar">
              <div className="bar-fill for" style={{ width: `${proposal.forVotes / (proposal.forVotes + proposal.againstVotes) * 100}%` }}>
              </div>
              <div className="bar-fill against"></div>
            </div>

            {proposal.status === 'active' && !proposal.userVoted && (
              <div className="voting-actions">
                <button className="btn btn-success" onClick={() => handleVote(proposal.id, 'for')}>
                  Vote For
                </button>
                <button className="btn btn-danger" onClick={() => handleVote(proposal.id, 'against')}>
                  Vote Against
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GovernancePanel;
