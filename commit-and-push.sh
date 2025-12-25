#!/bin/bash
# Commit all changes and push to GitHub

set -e

echo "🔧 Configuring Git..."
git config user.name "cryptonique0"
git config user.email "abdulganiyu838@gmail.com"

echo "📝 Adding all changes..."
git add .

echo "💾 Committing changes..."
git commit -m "feat: add comprehensive contract deployment and interaction system

- Add deployment scripts for all 4 contracts
- Add interaction scripts (mint, read-state, interact, execute-actions)
- Add 500+ lines of code examples
- Add comprehensive documentation (QUICKSTART, DEPLOYMENT, ARCHITECTURE, etc.)
- Update package.json with 8 new npm scripts
- Update hardhat.config.js for Base network support
- Add environment configuration template
- Add interactive menu system
- Add detailed script documentation

Ready for production deployment on Base mainnet"

echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Successfully committed and pushed all changes!"
echo ""
echo "📊 Summary:"
git log -1 --stat | head -20
