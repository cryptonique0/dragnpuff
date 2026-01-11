import React, { useState, useEffect } from 'react';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo">
          <h1>🐉 DragNPuff</h1>
        </div>

        <nav className="header-nav">
          <a href="/">Home</a>
          <a href="/mint">Mint</a>
          <a href="/marketplace">Marketplace</a>
          <a href="/staking">Staking</a>
          <a href="/governance">Governance</a>
          <a href="/about">About</a>
        </nav>

        <div className="header-actions">
          <button className="btn-connect">Connect Wallet</button>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {isOpen && (
        <nav className="mobile-nav">
          <a href="/">Home</a>
          <a href="/mint">Mint</a>
          <a href="/marketplace">Marketplace</a>
          <a href="/staking">Staking</a>
          <a href="/governance">Governance</a>
        </nav>
      )}
    </header>
  );
}
