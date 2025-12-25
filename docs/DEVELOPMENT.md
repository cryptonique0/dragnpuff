# Development Environment Setup

## Prerequisites

- Node.js 18+
- npm or yarn
- Git
- MetaMask wallet (for testing)

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/markcarey/dragnpuff.git
cd dragnpuff
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Hardhat (contract development)
- ethers.js (blockchain interaction)
- OpenZeppelin contracts (ERC721, ERC20)
- Testing libraries (chai, mocha)

### 3. Create Environment File

```bash
cp .env.template .env
```

Edit `.env` with your configuration:

```bash
# Network Configuration
PRIVATE_KEY=your_private_key_without_0x
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Optional
BASESCAN_API_KEY=your_basescan_key
```

## Development Workflow

### Start Local Blockchain

```bash
npm run dev
```

This starts a local Hardhat network on `http://127.0.0.1:8545`.

### Compile Contracts

```bash
npm run compile
```

Outputs compiled contracts to `artifacts/contracts/`.

### Run Tests

```bash
npm test
```

### Deploy Locally

```bash
npm run deploy:local
```

Deploys to local Hardhat network.

### Deploy to Base

```bash
npm run deploy
```

Deploys to Base mainnet (requires ETH for gas).

## IDE Setup

### VS Code

Install extensions:
- [Solidity by Juan Blanco](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity)
- [Hardhat for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=NomicFoundation.hardhat-foundry)

### Settings

Create `.vscode/settings.json`:

```json
{
  "[solidity]": {
    "editor.defaultFormatter": "JuanBlanco.solidity",
    "editor.formatOnSave": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

## Project Structure

```
dragnpuff/
├── contracts/          # Solidity smart contracts
├── scripts/            # Hardhat scripts
├── test/               # Test files
├── frontend/           # Frontend code (React/Vue)
├── docs/               # Documentation
├── constants/          # Configuration constants
├── utils/              # Utility modules
├── hardhat.config.js   # Hardhat configuration
├── package.json        # Dependencies
└── .env.template       # Environment template
```

## Common Commands

### Development

```bash
npm run dev              # Start local network
npm run compile          # Compile contracts
npm test                 # Run tests
npm run lint             # Lint code
npm run format           # Format code
```

### Deployment

```bash
npm run deploy           # Deploy to Base
npm run deploy:local     # Deploy locally
npm run interact         # Test contract interaction
npm run mint             # Mint test NFT
npm run read-state       # Read contract state
```

## Debugging

### Hardhat Console

```bash
npx hardhat console --network base
```

```javascript
> const dragnpuff = await ethers.getContractAt("DragNPuff", "0x...");
> const bal = await dragnpuff.balanceOf("0x...");
```

### Contract Verification

```bash
npx hardhat verify --network base <CONTRACT_ADDRESS>
```

## Troubleshooting

### Out of Memory

```bash
export NODE_OPTIONS=--max-old-space-size=4096
npm test
```

### Contract Not Compiling

```bash
rm -rf artifacts/
npm run compile
```

### RPC Errors

Check RPC endpoint is correct:

```bash
curl https://mainnet.base.org \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

## Next Steps

- [Deploy Guide](./DEPLOYMENT.md)
- [Smart Contracts](./CONTRACTS.md)
- [API Documentation](./API_REFERENCE.md)
