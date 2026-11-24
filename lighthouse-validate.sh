#!/bin/bash

# Lighthouse Validation Script for Crofter PWA
# This script runs Lighthouse tests on your application and generates reports

# Configuration
APP_URL="http://localhost:5173"
OUTPUT_DIR="./lighthouse-reports"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
OUTPUT_PREFIX="${OUTPUT_DIR}/lighthouse-report-${TIMESTAMP}"
OUTPUT_HTML="${OUTPUT_PREFIX}.report.html"
OUTPUT_JSON="${OUTPUT_PREFIX}.report.json"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

echo "🚀 Running Lighthouse validation on $APP_URL"
echo "📊 Reports will be saved to $OUTPUT_DIR"

# Run Lighthouse with PWA category enabled
lighthouse "$APP_URL" \
  --output html,json \
  --output-path "${OUTPUT_PREFIX}" \
  --chrome-flags="--headless" \
  --preset=desktop \
  --only-categories=performance,accessibility,best-practices,seo,pwa

# Check if the report was generated successfully
if [ -f "$OUTPUT_HTML" ]; then
  echo "✅ Lighthouse validation completed successfully!"
  echo "📄 HTML Report: $OUTPUT_HTML"
  echo "📄 JSON Report: $OUTPUT_JSON"
  
  # Extract scores from JSON report
  echo ""
  echo "📊 Lighthouse Scores:"
  echo ""
  
  # Use jq to extract scores if available
  if command -v jq &> /dev/null; then
    PERFORMANCE=$(jq '.categories.performance.score * 100' "$OUTPUT_JSON")
    ACCESSIBILITY=$(jq '.categories.accessibility.score * 100' "$OUTPUT_JSON")
    BEST_PRACTICES=$(jq '.categories["best-practices"].score * 100' "$OUTPUT_JSON")
    SEO=$(jq '.categories.seo.score * 100' "$OUTPUT_JSON")
    PWA=$(jq '.categories.pwa.score * 100' "$OUTPUT_JSON" 2>/dev/null || echo "N/A")
    
    echo "Performance:     ${PERFORMANCE}%"
    echo "Accessibility:   ${ACCESSIBILITY}%"
    echo "Best Practices:  ${BEST_PRACTICES}%"
    echo "SEO:             ${SEO}%"
    echo "PWA:             ${PWA}%"
  else
    echo "⚠️  Install jq for score extraction: brew install jq"
  fi
  
  # Open the HTML report
  echo ""
  echo "🌐 Opening HTML report in your default browser..."
  open "$OUTPUT_HTML"
else
  echo "❌ Lighthouse validation failed!"
  echo "Could not find report at $OUTPUT_HTML"
  ls -la "$OUTPUT_DIR"
fi
