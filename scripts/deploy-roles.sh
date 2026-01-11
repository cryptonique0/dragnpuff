#!/bin/bash

# DragNRoles Deployment Script
# Deploys the House Roles & Loadouts smart contract and integrates with the game

set -e

echo "🐉 Deploying DragNRoles Contract..."

# Check environment variables
if [ -z "$NETWORK" ]; then
  NETWORK="base"
  echo "Using default network: $NETWORK"
fi

# Deploy contract
echo "📦 Compiling DragNRoles contract..."
npx hardhat compile

echo "🚀 Deploying to $NETWORK..."
DEPLOYMENT_OUTPUT=$(npx hardhat run scripts/deploy-roles.js --network $NETWORK)
ROLES_ADDRESS=$(echo "$DEPLOYMENT_OUTPUT" | grep "DragNRoles deployed to:" | awk '{print $NF}')

if [ -z "$ROLES_ADDRESS" ]; then
  echo "❌ Deployment failed"
  exit 1
fi

echo "✅ DragNRoles deployed to: $ROLES_ADDRESS"

# Update .env file
echo "📝 Updating .env file..."
if grep -q "DRAGNROLES_ADDRESS" .env; then
  sed -i.bak "s/^DRAGNROLES_ADDRESS=.*/DRAGNROLES_ADDRESS=$ROLES_ADDRESS/" .env
  rm .env.bak
else
  echo "DRAGNROLES_ADDRESS=$ROLES_ADDRESS" >> .env
fi

# Update contract addresses constant
echo "📝 Updating contract addresses constant..."
cat > constants/addresses.js << EOF
module.exports = {
  BASE_NETWORK: {
    DRAGN_PUFF: process.env.DRAGN_PUFF_ADDRESS || '0x5eCbc3931C78169cbF682C9b15602EB8f9A42387',
    ERC721_MINTER: process.env.ERC721_MINTER_ADDRESS || '0x1dfA9A1afe793882229111Df790B09155EDF86e0',
    SEASONAL_WARS: process.env.SEASONAL_WARS_ADDRESS || '',
    DRAGN_ROLES: process.env.DRAGNROLES_ADDRESS || '$ROLES_ADDRESS'
  }
};
EOF

# Run tests
echo "🧪 Running DragNRoles tests..."
npx hardhat test test/DragNRoles.test.js

# Output summary
echo ""
echo "════════════════════════════════════════════"
echo "✅ DragNRoles Deployment Complete!"
echo "════════════════════════════════════════════"
echo ""
echo "📋 Deployment Summary:"
echo "  Network: $NETWORK"
echo "  Contract Address: $ROLES_ADDRESS"
echo "  ABI Location: artifacts/contracts/DragNRoles.sol/DragNRoles.json"
echo ""
echo "🔧 Next Steps:"
echo "  1. Verify contract on block explorer"
echo "  2. Test API endpoints:"
echo "     - GET /api/roles/available"
echo "     - GET /api/roles/user/:address/loadout"
echo "  3. Deploy to Firebase functions"
echo "  4. Test frames at /api/frames/roles"
echo ""
echo "📚 Documentation:"
echo "  - Full guide: docs/HOUSE_ROLES.md"
echo "  - API Reference: docs/API.md"
echo "  - README: README.md"
echo ""
