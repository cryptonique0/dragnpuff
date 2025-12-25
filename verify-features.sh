#!/bin/bash
# Verification script to check all 50 features have been created

set -e

cd /workspaces/dragnpuff

echo "================================"
echo "Verifying 50 Features Created"
echo "================================"
echo ""

# Track count
count=0

# Function to check file
check_file() {
    local file=$1
    local name=$2
    if [ -f "$file" ] || [ -d "$file" ]; then
        ((count++))
        echo "✓ $count. $name"
        return 0
    else
        echo "✗ Missing: $name ($file)"
        return 1
    fi
}

echo "Documentation Files:"
check_file "CONTRIBUTING.md" "Contributing guidelines"
check_file "CODE_OF_CONDUCT.md" "Code of conduct"
check_file "SECURITY.md" "Security policy"
check_file "CHANGELOG.md" "Changelog"
check_file ".env.example" "Environment template"
check_file ".eslintrc.json" "ESLint config"
check_file ".prettierrc.json" "Prettier config"

echo ""
echo "Documentation in docs/:"
check_file "docs/HARDHAT_CONFIG.md" "Hardhat config guide"
check_file "docs/CONTRACTS.md" "Contracts documentation"
check_file "docs/FIREBASE_SETUP.md" "Firebase setup guide"
check_file "docs/API.md" "API documentation"
check_file "docs/ARCHITECTURE.md" "Architecture documentation"
check_file "docs/INDEX.md" "Documentation index"
check_file "docs/TROUBLESHOOTING.md" "Troubleshooting guide"
check_file "docs/FAQ.md" "FAQ document"

echo ""
echo "Scripts:"
check_file "scripts/deploy.sh" "Deployment script"
check_file "scripts/test.sh" "Test script"
check_file "scripts/add-features.sh" "Feature addition script"
check_file "push-all-features.sh" "Push all features script"

echo ""
echo "Utility Modules:"
check_file "utils/interfaces.js" "Contract interfaces"
check_file "utils/blockchain.js" "Blockchain utilities"
check_file "utils/validation.js" "Address validation"
check_file "utils/transactions.js" "Transaction utilities"
check_file "utils/wallet.js" "Wallet utilities"
check_file "utils/logger.js" "Logger utility"
check_file "utils/cache.js" "Cache utility"
check_file "utils/formatters.js" "Data formatters"
check_file "utils/math.js" "Math utilities"
check_file "utils/dates.js" "Date utilities"
check_file "utils/strings.js" "String utilities"
check_file "utils/http.js" "HTTP client"
check_file "utils/storage.js" "Storage layer"
check_file "utils/events.js" "Event emitter"
check_file "utils/retry.js" "Retry mechanism"
check_file "utils/queue.js" "Queue processor"
check_file "utils/rateLimiter.js" "Rate limiter"
check_file "utils/analytics.js" "Analytics helper"
check_file "utils/leaderboard.js" "Leaderboard calculations"
check_file "utils/rewards.js" "Reward calculations"
check_file "utils/profile.js" "User profile"
check_file "utils/houses.js" "House utilities"
check_file "utils/metadata.js" "NFT metadata"
check_file "utils/performance.js" "Performance monitoring"
check_file "utils/errors.js" "Error handling"
check_file "utils/dev.js" "Development utilities"
check_file "utils/test.js" "Testing utilities"
check_file "utils/security.js" "Security utilities"

echo ""
echo "Constants:"
check_file "constants/addresses.js" "Blockchain addresses"
check_file "constants/game.js" "Game constants"
check_file "constants/networks.js" "Network configs"
check_file "constants/errors.js" "Error codes"

echo ""
echo "================================"
echo "Total Features Created: $count"
echo "================================"
echo ""

if [ $count -ge 40 ]; then
    echo "✅ Most features have been created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Review the files created"
    echo "2. Run: git add ."
    echo "3. Run: git commit -m 'feat: add 50 development features'"
    echo "4. Run: git push origin main"
else
    echo "⚠️  Only $count features created out of 50"
fi
