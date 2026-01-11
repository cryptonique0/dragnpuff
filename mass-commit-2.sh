#!/bin/bash

# Comprehensive Feature Commit Script
# Creates organized commits for all new features

cd /workspaces/dragnpuff

echo "=== Starting Mass Feature Commit ===" 

# 1. API Models
echo "Committing API Models..."
git add api/models/User.js
git commit -m "feat: add User model with authentication support"
git add api/models/NFT.js
git commit -m "feat: add NFT model for metadata and ownership tracking"
git add api/models/Staking.js
git commit -m "feat: add Staking model with reward calculations"
git add api/models/Listing.js
git commit -m "feat: add Listing model for marketplace"

# 2. API Middleware
echo "Committing API Middleware..."
git add api/middleware/auth.js
git commit -m "feat: add authentication middleware with Web3 signature verification"
git add api/middleware/validation.js
git commit -m "feat: add request validation middleware"
git add api/middleware/errorHandler.js
git commit -m "feat: add error handling middleware and async wrapper"

# 3. API Controllers
echo "Committing API Controllers..."
git add api/controllers/nftController.js
git commit -m "feat: add NFT controller with minting and transfer logic"
git add api/controllers/marketplaceController.js
git commit -m "feat: add marketplace controller with listing and bidding"
git add api/controllers/stakingController.js
git commit -m "feat: add staking controller with rewards and APY tiers"
git add api/controllers/tokenController.js
git commit -m "feat: add token controller for ERC20 operations"

# 4. Frontend Components
echo "Committing Frontend Components..."
git add frontend/components/NFTCard.jsx
git commit -m "feat: add NFTCard component for displaying NFTs"
git add frontend/components/StakingPanel.jsx
git commit -m "feat: add StakingPanel component with lock periods"
git add frontend/components/Marketplace.jsx
git commit -m "feat: add Marketplace component with filtering"
git add frontend/components/GovernancePanel.jsx
git commit -m "feat: add GovernancePanel component for voting"

# 5. Frontend Hooks
echo "Committing Frontend Hooks..."
git add frontend/hooks/useDragNPuffContract.js
git commit -m "feat: add useDragNPuffContract hook for contract interactions"
git add frontend/hooks/useApi.js
git commit -m "feat: add useApi hook for API calls with caching"

# 6. Utilities
echo "Committing Utility Functions..."
git add utils/stringHelpers.js
git commit -m "feat: add string utility helpers (truncate, slugify, case conversion)"
git add utils/numberHelpers.js
git commit -m "feat: add number utility helpers (formatting, wei conversion)"
git add utils/dateHelpers.js
git commit -m "feat: add date utility helpers (formatting, relative time)"

echo "=== All commits completed ===" 
git log --oneline | head -20

echo "=== Pushing to GitHub ===" 
git push origin main

echo "=== Feature commit script complete ===" 
