/**
 * Admin Dashboard Component
 * Displays admin controls and platform statistics
 */

import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVolume: 0,
    totalListings: 0,
    floorPrice: 0,
    activeProposals: 0
  });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // TODO: Fetch admin stats
    setStats({
      totalUsers: 1250,
      totalVolume: 15678.5,
      totalListings: 450,
      floorPrice: 1.85,
      activeProposals: 3
    });
  }, []);

  const handleEmergencyPause = async () => {
    if (window.confirm('Are you sure you want to pause the platform?')) {
      // TODO: Call emergency pause function
      console.log('Platform paused');
    }
  };

  const handleResumeOperations = async () => {
    // TODO: Call resume function
    console.log('Platform resumed');
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="value">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Volume</h3>
          <p className="value">{stats.totalVolume.toFixed(2)} ETH</p>
        </div>
        <div className="stat-card">
          <h3>Active Listings</h3>
          <p className="value">{stats.totalListings}</p>
        </div>
        <div className="stat-card">
          <h3>Floor Price</h3>
          <p className="value">{stats.floorPrice} ETH</p>
        </div>
        <div className="stat-card">
          <h3>Active Proposals</h3>
          <p className="value">{stats.activeProposals}</p>
        </div>
      </div>

      <div className="admin-controls">
        <h2>Platform Controls</h2>
        <div className="control-buttons">
          <button className="btn btn-warning" onClick={handleEmergencyPause}>
            Emergency Pause
          </button>
          <button className="btn btn-success" onClick={handleResumeOperations}>
            Resume Operations
          </button>
        </div>
      </div>

      <div className="admin-logs">
        <h2>Recent Activity Logs</h2>
        <ul className="log-list">
          {logs.length === 0 ? (
            <li>No recent activity</li>
          ) : (
            logs.map((log, index) => (
              <li key={index} className={`log-entry ${log.type}`}>
                <span className="timestamp">{log.timestamp}</span>
                <span className="message">{log.message}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
