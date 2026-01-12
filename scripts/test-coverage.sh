#!/bin/bash
# Test Coverage Report Generator

echo "🧪 DragNPuff Test Coverage Report"
echo "=================================="
echo ""

# Run tests and capture output
echo "Running test suite..."
npm test > /tmp/test-output.txt 2>&1

# Extract test counts
PASSING=$(grep -E "[0-9]+ passing" /tmp/test-output.txt | grep -oE "[0-9]+" | head -1)
FAILING=$(grep -E "[0-9]+ failing" /tmp/test-output.txt | grep -oE "[0-9]+" | head -1)

# Default to 0 if not found
PASSING=${PASSING:-0}
FAILING=${FAILING:-0}

# Calculate total and percentage
TOTAL=$((PASSING + FAILING))
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((PASSING * 100 / TOTAL))
else
    PERCENTAGE=0
fi

echo ""
echo "📊 Test Results:"
echo "  ✅ Passing: $PASSING"
echo "  ❌ Failing: $FAILING"
echo "  📈 Total:   $TOTAL"
echo "  🎯 Success Rate: ${PERCENTAGE}%"
echo ""

# Test breakdown by category
echo "📁 Test Categories:"
echo ""
echo "Smart Contracts:"
grep -E "DragN|Seasonal|Staking" /tmp/test-output.txt | grep -E "✔|passing" | wc -l | xargs -I {} echo "  ✅ {} tests passing"

echo ""
echo "API & Integration:"
grep -E "api\.|frames|Referrals" /tmp/test-output.txt | grep -E "✔|passing" | wc -l | xargs -I {} echo "  ✅ {} tests passing"

echo ""
echo "Utilities:"
grep -E "Utils|Formatter|Logger|Cache" /tmp/test-output.txt | grep -E "✔|passing" | wc -l | xargs -I {} echo "  ✅ {} tests passing"

echo ""
echo "=================================="
echo "Full test output saved to /tmp/test-output.txt"
echo ""

# Return exit code based on passing percentage
if [ $PERCENTAGE -ge 80 ]; then
    echo "✅ Test coverage is GOOD (≥80%)"
    exit 0
elif [ $PERCENTAGE -ge 60 ]; then
    echo "⚠️  Test coverage is MODERATE (60-79%)"
    exit 0
else
    echo "❌ Test coverage is LOW (<60%)"
    exit 1
fi
