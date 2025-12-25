# Hardhat Configuration Guide

## Overview
House of the DragNs uses Hardhat as the Ethereum development environment for smart contract compilation, testing, and deployment.

## Configuration File
The main configuration is in `hardhat.config.js`.

## Networks

### Supported Networks
- **Base (Mainnet)**: chainId 8453
- **Base (Sepolia)**: chainId 84531
- **Ethereum (Mainnet)**: chainId 1
- **Sepolia (Testnet)**: chainId 11155111

## Compilation

```bash
npx hardhat compile
```

Compiles all contracts in the `contracts/` directory and generates artifacts in `artifacts/`.

## Testing

```bash
npx hardhat test
```

Runs all tests in the `test/` directory.

## Deployment

```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

## Gas Configuration

Set `REPORT_GAS=true` to see gas usage reports:

```bash
REPORT_GAS=true npx hardhat test
```

## Environment Variables

Create a `.env` file with:
```
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_key
ETHERSCAN_API_KEY=your_etherscan_key
```

## Verification

To verify contracts on Etherscan:

```bash
npx hardhat verify --network <network> <contract-address> <constructor-arguments>
```

## Debug

```bash
npx hardhat node
```

Starts a local Hardhat node for testing.
