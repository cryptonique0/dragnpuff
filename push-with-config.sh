#!/bin/bash
# Configure git and push changes

set -e

echo "🔧 Configuring Git with user credentials..."
git config user.name "cryptonique0"
git config user.email "abdulganiyu838@gmail.com"

echo "✓ Git configured"
echo ""

echo "📊 Current status:"
git status --short

echo ""
echo "📝 Recent commits:"
git log --oneline | head -3

echo ""
echo "🚀 Pushing changes to GitHub..."
git push origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo ""
echo "Commit info:"
git log -1 --oneline
git log -1 --pretty=format:"%an <%ae>"

echo ""
echo "✨ Done!"
