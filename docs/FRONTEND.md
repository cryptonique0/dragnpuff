# Frontend Development Guide

## Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

## Hooks

### useWallet
Connect to wallet and manage connection state.

```javascript
import { useWallet } from '../hooks/useWallet';

function Component() {
  const { address, connect, disconnect, isConnected } = useWallet();

  return (
    <button onClick={isConnected ? disconnect : connect}>
      {isConnected ? `Disconnect ${address}` : 'Connect Wallet'}
    </button>
  );
}
```

### useDragNPuff
Interact with DragNPuff contract.

```javascript
import { useDragNPuff } from '../hooks/useDragNPuff';

function NFTComponent() {
  const { balance, mint, getBalance } = useDragNPuff();

  return (
    <div>
      <p>Balance: {balance}</p>
      <button onClick={() => mint(address, fee)}>Mint NFT</button>
    </div>
  );
}
```

### useFairToken
Interact with FairToken contract.

```javascript
import { useFairToken } from '../hooks/useFairToken';

function TokenComponent() {
  const { balance, transfer, approve } = useFairToken();

  return (
    <div>
      <p>Balance: {balance}</p>
      <button onClick={() => transfer(to, amount)}>Transfer</button>
    </div>
  );
}
```

## Project Structure

```
frontend/
├── components/
│   ├── Header.jsx
│   ├── Wallet.jsx
│   ├── NFTGrid.jsx
│   └── TokenPanel.jsx
├── hooks/
│   ├── useWallet.js
│   ├── useDragNPuff.js
│   ├── useFairToken.js
│   └── useContract.js
├── pages/
│   ├── Home.jsx
│   ├── Mint.jsx
│   ├── Profile.jsx
│   └── Trade.jsx
├── styles/
│   └── globals.css
├── utils/
│   └── contracts.js
└── App.jsx
```

## Component Examples

### Header Component

```javascript
import React from 'react';
import { useWallet } from '../hooks/useWallet';

export function Header() {
  const { address, connect, disconnect, isConnected } = useWallet();

  return (
    <header>
      <h1>DragNPuff</h1>
      {isConnected ? (
        <>
          <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
          <button onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </header>
  );
}
```

### NFT Minting Component

```javascript
import React, { useState } from 'react';
import { useDragNPuff } from '../hooks/useDragNPuff';
import { useWallet } from '../hooks/useWallet';

export function MintNFT() {
  const { address } = useWallet();
  const { mint, isLoading, error } = useDragNPuff();
  const [uri, setUri] = useState('');

  const handleMint = async () => {
    const fee = '1000000000000000000'; // 1 ETH
    await mint(address, fee);
  };

  return (
    <div>
      <h2>Mint NFT</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <input 
        value={uri}
        onChange={(e) => setUri(e.target.value)}
        placeholder="IPFS URI"
      />
      <button onClick={handleMint} disabled={isLoading}>
        {isLoading ? 'Minting...' : 'Mint'}
      </button>
    </div>
  );
}
```

## Styling

Use CSS modules or Tailwind CSS:

```javascript
import styles from './Component.module.css';

export function Component() {
  return <div className={styles.container}>...</div>;
}
```

## State Management

For complex state, use Context API or Redux:

```javascript
import { createContext, useState } from 'react';

export const GameContext = createContext();

export function GameProvider({ children }) {
  const [playerState, setPlayerState] = useState({...});

  return (
    <GameContext.Provider value={{ playerState, setPlayerState }}>
      {children}
    </GameContext.Provider>
  );
}
```

## Error Handling

```javascript
try {
  await transaction();
} catch (error) {
  console.error('Transaction failed:', error);
  setError(error.message);
}
```

## Performance

1. Use `React.memo` for expensive components
2. Use `useCallback` for stable function references
3. Lazy load routes with `React.lazy`
4. Optimize images with next/image

## Testing

```bash
npm run test:frontend
```

## See Also

- [React Hooks Documentation](https://react.dev/reference/react/hooks)
- [ethers.js Guide](https://docs.ethers.org/)
- [Smart Contract Interaction](./CONTRACTS.md)
