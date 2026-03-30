#!/usr/bin/env bash
set -euo pipefail

echo "1. Copy .env.example to .env.local and fill in Supabase keys."
echo "2. Run: npm install"
echo "3. Run: supabase start"
echo "4. Run: supabase db reset --local"
echo "5. Run: npm run dev"
