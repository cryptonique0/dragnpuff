#!/bin/bash
# EXECUTE THIS SCRIPT TO GENERATE AND PUSH 500 COMMITS

echo "=================================================="
echo "  500 Organic Commits Generator"
echo "  DragNPuff Project"
echo "=================================================="
echo ""

# First, commit any pending changes
echo "Step 1: Committing existing changes..."
git add -A
git commit -m "chore: prepare for organic commit generation" || echo "Nothing to commit"

echo ""
echo "Step 2: Running commit generation..."
echo ""

# Execute the fast script
bash fast-500.sh

echo ""
echo "Step 3: Verifying commits..."
total=$(git log --oneline | wc -l)
echo "Total commits in repository: $total"

echo ""
echo "Step 4: Pushing to GitHub..."
echo ""

# Push to GitHub
git push origin main

echo ""
echo "=================================================="
echo "  ✅ COMPLETE!"
echo "=================================================="
echo ""
echo "Repository now has $total commits"
echo "Check your GitHub repository at:"
echo "https://github.com/markcarey/dragnpuff"
echo ""
