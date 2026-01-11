#!/bin/bash

# Initialize git if needed and set up credentials
cd /workspaces/dragnpuff

echo "=== Starting Git Commits for New Features ===" 

# Get total file count
INITIAL_COMMIT_COUNT=$(git log --oneline 2>/dev/null | wc -l)
echo "Initial commit count: $INITIAL_COMMIT_COUNT"

# 1. API Models (4 commits)
echo "Step 1: Committing API Models..."
git add api/models/User.js && git commit -m "feat: add User model with auth support"
git add api/models/NFT.js && git commit -m "feat: add NFT model for metadata"
git add api/models/Staking.js && git commit -m "feat: add Staking model with rewards"
git add api/models/Listing.js && git commit -m "feat: add Listing model for marketplace"

# 2. API Middleware (3 commits)
echo "Step 2: Committing API Middleware..."
git add api/middleware/auth.js && git commit -m "feat: add auth middleware with Web3 verification"
git add api/middleware/validation.js && git commit -m "feat: add validation middleware"
git add api/middleware/errorHandler.js && git commit -m "feat: add error handling middleware"

# 3. API Controllers (4 commits)
echo "Step 3: Committing API Controllers..."
git add api/controllers/nftController.js && git commit -m "feat: add NFT controller"
git add api/controllers/marketplaceController.js && git commit -m "feat: add marketplace controller"
git add api/controllers/stakingController.js && git commit -m "feat: add staking controller"
git add api/controllers/tokenController.js && git commit -m "feat: add token controller"

# 4. Frontend Components (5 commits)
echo "Step 4: Committing Frontend Components..."
git add frontend/components/NFTCard.jsx && git commit -m "feat: add NFTCard component"
git add frontend/components/StakingPanel.jsx && git commit -m "feat: add StakingPanel component"
git add frontend/components/Marketplace.jsx && git commit -m "feat: add Marketplace component"
git add frontend/components/GovernancePanel.jsx && git commit -m "feat: add GovernancePanel component"
git add frontend/components/AdminDashboard.jsx && git commit -m "feat: add AdminDashboard component"

# 5. Frontend Hooks (3 commits)
echo "Step 5: Committing Frontend Hooks..."
git add frontend/hooks/useDragNPuffContract.js && git commit -m "feat: add useDragNPuffContract hook"
git add frontend/hooks/useApi.js && git commit -m "feat: add useApi hook"
git add frontend/hooks/useContract.js && git commit -m "feat: add useContract hook"

# 6. Utility Functions (5 commits)
echo "Step 6: Committing Utilities..."
git add utils/stringHelpers.js && git commit -m "feat: add string utility helpers"
git add utils/numberHelpers.js && git commit -m "feat: add number utility helpers"
git add utils/dateHelpers.js && git commit -m "feat: add date utility helpers"
git add utils/arrayHelpers.js && git commit -m "feat: add array utility helpers"
git add utils/validationHelpers.js && git commit -m "feat: add validation utility helpers"
git add utils/storageHelpers.js && git commit -m "feat: add storage utility helpers"

# 7. Tests (2 commits)
echo "Step 7: Committing Tests..."
git add test/api.integration.test.js && git commit -m "feat: add API integration tests"
git add test/components.test.js && git commit -m "feat: add component unit tests"

# 8. Documentation (2 commits)
echo "Step 8: Committing Documentation..."
git add docs/API_DOCUMENTATION.md && git commit -m "docs: add comprehensive API documentation"
git add docs/DATABASE_SCHEMA.md && git commit -m "docs: add database schema documentation"

# Count final commits
FINAL_COMMIT_COUNT=$(git log --oneline 2>/dev/null | wc -l)
COMMITS_ADDED=$((FINAL_COMMIT_COUNT - INITIAL_COMMIT_COUNT))

echo ""
echo "=== Commit Summary ===" 
echo "Initial commits: $INITIAL_COMMIT_COUNT"
echo "Final commits: $FINAL_COMMIT_COUNT"
echo "Commits added: $COMMITS_ADDED"
echo ""
echo "=== Recent Commits ===" 
git log --oneline | head -30

echo ""
echo "=== Pushing to GitHub ===" 
git push origin main

echo ""
echo "=== Feature commit script complete ===" 
