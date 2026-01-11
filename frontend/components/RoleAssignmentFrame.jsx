import React, { useState, useEffect } from 'react';
import { useRoles } from '@/hooks/useRoles';

export function RoleAssignmentFrame() {
  const { roles, assignRole, loading, error } = useRoles();
  const [state, setState] = useState('browse'); // browse, select_dragn, confirm, done
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedDragN, setSelectedDragN] = useState(null);
  const [userDragNs, setUserDragNs] = useState([]);
  const [loadingDragNs, setLoadingDragNs] = useState(false);

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

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setState('select_dragn');
  };

  const handleDragNSelect = (dragN) => {
    setSelectedDragN(dragN);
    setState('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedRole || !selectedDragN) return;
    
    try {
      await assignRole(selectedDragN.tokenId, selectedRole.id, 0); // House 0 for now
      setState('done');
    } catch (err) {
      console.error('Failed to assign role:', err);
    }
  };

  const handleReset = () => {
    setSelectedRole(null);
    setSelectedDragN(null);
    setState('browse');
  };

  return (
    <div className="role-assignment-frame">
      {state === 'browse' && (
        <BrowseRoles
          roles={roles}
          onSelectRole={handleRoleSelect}
          loading={loading}
          error={error}
        />
      )}
      
      {state === 'select_dragn' && (
        <SelectDragN
          dragns={userDragNs}
          selectedRole={selectedRole}
          onSelectDragN={handleDragNSelect}
          onBack={() => setState('browse')}
          loading={loadingDragNs}
        />
      )}
      
      {state === 'confirm' && (
        <ConfirmAssignment
          dragN={selectedDragN}
          role={selectedRole}
          onConfirm={handleConfirm}
          onBack={() => setState('select_dragn')}
          loading={loading}
        />
      )}
      
      {state === 'done' && (
        <DoneState
          dragN={selectedDragN}
          role={selectedRole}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

function BrowseRoles({ roles, onSelectRole, loading, error }) {
  if (loading) return <div className="state-loading">Loading roles...</div>;
  if (error) return <div className="state-error">Error: {error}</div>;

  return (
    <div className="state-browse">
      <h2>Choose a Role for Your DragN</h2>
      <p>Each role provides unique gameplay advantages.</p>
      
      <div className="roles-grid">
        {roles.map(role => (
          <div key={role.id} className="role-card">
            <div className="role-header">
              <h3>{role.name}</h3>
              <div className="role-icon">{getRoleIcon(role.id)}</div>
            </div>
            
            <div className="role-modifiers">
              {role.attackMultiplier && (
                <div className="modifier">
                  <span className="label">Attack</span>
                  <span className={`value ${role.attackMultiplier > 1 ? 'positive' : 'negative'}`}>
                    {role.attackMultiplier}x
                  </span>
                </div>
              )}
              {role.defenseMultiplier && (
                <div className="modifier">
                  <span className="label">Defense</span>
                  <span className={`value ${role.defenseMultiplier > 1 ? 'positive' : 'negative'}`}>
                    {role.defenseMultiplier}x
                  </span>
                </div>
              )}
              {role.recruitMultiplier && (
                <div className="modifier">
                  <span className="label">Recruit</span>
                  <span className={`value ${role.recruitMultiplier > 1 ? 'positive' : 'negative'}`}>
                    {role.recruitMultiplier}x
                  </span>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => onSelectRole(role)}
              className="select-button"
            >
              Select {role.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SelectDragN({ dragns, selectedRole, onSelectDragN, onBack, loading }) {
  if (loading) return <div className="state-loading">Loading your DragNs...</div>;

  return (
    <div className="state-select">
      <div className="back-button" onClick={onBack}>← Back</div>
      
      <h2>Select a DragN</h2>
      <p>Choose which DragN to assign to the {selectedRole?.name} role.</p>
      
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

function ConfirmAssignment({ dragN, role, onConfirm, onBack, loading }) {
  return (
    <div className="state-confirm">
      <div className="back-button" onClick={onBack}>← Back</div>
      
      <h2>Confirm Role Assignment</h2>
      
      <div className="confirmation-summary">
        <div className="dragn-preview">
          <img src={dragN?.image} alt={`DragN #${dragN?.tokenId}`} />
          <div className="dragn-id">DragN #{dragN?.tokenId}</div>
        </div>
        
        <div className="arrow">→</div>
        
        <div className="role-preview">
          <div className="role-icon">{getRoleIcon(role?.id)}</div>
          <div className="role-name">{role?.name}</div>
        </div>
      </div>
      
      <div className="role-stats">
        <h3>Role Benefits</h3>
        {role?.attackMultiplier && (
          <div className="stat-row">
            <span>Attack Modifier:</span>
            <strong className={role.attackMultiplier > 1 ? 'positive' : 'negative'}>
              {role.attackMultiplier}x
            </strong>
          </div>
        )}
        {role?.defenseMultiplier && (
          <div className="stat-row">
            <span>Defense Modifier:</span>
            <strong className={role.defenseMultiplier > 1 ? 'positive' : 'negative'}>
              {role.defenseMultiplier}x
            </strong>
          </div>
        )}
        {role?.recruitMultiplier && (
          <div className="stat-row">
            <span>Recruit Modifier:</span>
            <strong className={role.recruitMultiplier > 1 ? 'positive' : 'negative'}>
              {role.recruitMultiplier}x
            </strong>
          </div>
        )}
      </div>
      
      <button 
        onClick={onConfirm}
        disabled={loading}
        className="confirm-button"
      >
        {loading ? 'Assigning...' : 'Confirm Assignment'}
      </button>
    </div>
  );
}

function DoneState({ dragN, role, onReset }) {
  return (
    <div className="state-done">
      <div className="success-message">
        <div className="success-icon">✓</div>
        <h2>Role Assigned!</h2>
      </div>
      
      <div className="assignment-result">
        <p>
          DragN #{dragN?.tokenId} is now a <strong>{role?.name}</strong>
        </p>
      </div>
      
      <button 
        onClick={onReset}
        className="assign-another-button"
      >
        Assign Another DragN
      </button>
    </div>
  );
}

function getRoleIcon(roleId) {
  switch(roleId) {
    case 1: return '⚔️'; // Scout - attack
    case 2: return '🛡️'; // Defender - shield
    case 3: return '🤝'; // Support - handshake
    default: return '🐉';
  }
}

export default RoleAssignmentFrame;
