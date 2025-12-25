#!/bin/bash
# Test script for House of the DragNs

set -e

echo "🧪 Running tests..."

# Run Hardhat tests
echo "Testing smart contracts..."
npx hardhat test

# Run linter
echo "Linting code..."
npx eslint . --ext .js,.jsx,.ts,.tsx

echo "✅ All tests passed!"
