#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database (if needed)..."
npx prisma db seed || echo "Seed skipped (already seeded or no seed script)"

echo "🚀 Starting server..."
node dist/server.js
