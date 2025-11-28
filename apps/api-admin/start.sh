#!/bin/bash
# Start Auth API service with all required environment variables

export API_ADMIN_PORT=7100
export JWT_SECRET=dev-jwt-secret-minimum-32-characters-long-for-development-only
# API 7100 → DB 5100 (change first digit: 7 → 5)
export DATABASE_URL_ADMIN=postgresql://postgres:postgres@localhost:5100/workix_admin
export SERVICE_KEY=dev-service-key-minimum-32-characters-long-for-development-only

cd "$(dirname "$0")"
npx tsx --tsconfig ../../tsconfig.base.json src/main.ts
