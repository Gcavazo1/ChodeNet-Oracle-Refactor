#!/bin/bash

# Run AI Governance System Tests
# This script runs tests for the AI Governance Control System

# Set environment variables (replace with your actual values)
export SUPABASE_URL="https://errgidlsmozmfnsoyxvw.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycmdpZGxzbW96bWZuc295eHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc1MzYxNTYsImV4cCI6MjAyMzExMjE1Nn0.xKVJ8GHoGN2PYgBGXrWUfLYRqytKI-fdvPJhx0OwbNg"
export APP_URL="https://chode-net-oracle.vercel.app"

# Optional: Set these variables if you want to automatically approve admin polls
# export SUPABASE_SERVICE_KEY="your-service-key"
# export ADMIN_WALLET="your-admin-wallet"
# export AUTO_APPROVE="true"

echo "🧪 Running AI Governance System Tests"
echo "======================================"

echo -e "\n1️⃣ Testing Autonomous Poll Creation"
echo "--------------------------------------"
node test_autonomous_poll.js

echo -e "\n2️⃣ Testing Admin Approval Poll Creation"
echo "-------------------------------------------"
node test_admin_approval_poll.js

echo -e "\n3️⃣ Testing Emergency Brake"
echo "-----------------------------"
echo "To test the emergency brake, run the following command:"
echo "node -e \"fetch('$SUPABASE_URL/functions/v1/test-ai-governance', { method: 'POST', headers: { 'Authorization': 'Bearer $SUPABASE_ANON_KEY', 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario: 'emergency_test' }) }).then(res => res.json()).then(console.log).catch(console.error)\""

echo -e "\n✅ Tests completed!"
echo "Check the admin dashboard to see the results: $APP_URL/admin" 