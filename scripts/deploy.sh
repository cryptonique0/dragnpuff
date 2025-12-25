#!/bin/bash
# Deployment script for House of the DragNs

set -e

echo "🚀 Starting deployment..."

# Check environment
if [ ! -f .env ]; then
  echo "❌ .env file not found. Please create it from .env.example"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm test

# Build contracts
echo "🏗️ Building contracts..."
npx hardhat compile

# Run linter
echo "🔍 Running linter..."
npm run lint

# Deploy to Firebase
echo "📤 Deploying to Firebase..."
npx firebase deploy

echo "✅ Deployment complete!"
