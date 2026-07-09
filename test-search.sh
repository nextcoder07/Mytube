#!/bin/bash
# Quick test script for search functionality

echo "🧪 Search System Test Suite"
echo "======================================"
echo ""

# Configuration
API="http://localhost:3000"
QUERIES=(
  "cars"
  "javascript tutorial"
  "machine learning"
  "web development"
  "rust programming"
  "@torvalds"
)

echo "Testing basic search (non-AI)..."
echo ""

for query in "${QUERIES[@]}"; do
  echo "📋 Query: '$query'"
  
  # Make request
  response=$(curl -s "$API/search?q=$(echo "$query" | sed 's/ /%20/g')" \
    -H "Content-Type: application/json")
  
  # Count results
  count=$(echo "$response" | jq '.data | length')
  echo "   Results: $count"
  
  # Show provider breakdown
  providers=$(echo "$response" | jq -r '.data[].source' | sort | uniq -c)
  echo "   Breakdown:"
  echo "$providers" | sed 's/^/     /'
  
  echo ""
done

echo ""
echo "Testing AI search..."
echo ""

# Test AI search
query="machine learning"
echo "📋 AI Query: '$query'"
echo "   Context: 'I am a beginner, prefer video tutorials'"

response=$(curl -s -X POST "$API/search/ai" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"$query\",
    \"aiContext\": \"I am a beginner, prefer video tutorials\"
  }")

count=$(echo "$response" | jq '.data | length')
echo "   Results: $count"

# Show with AI scores
echo "   Top 3 results:"
echo "$response" | jq -r '.data[0:3] | .[] | "   - \(.title) (AI Score: \(.metadata.aiScore // "N/A"), Source: \(.source))"'

echo ""
echo "✅ Test complete!"
