#!/bin/bash
# Start Auth API service with all required environment variables

export API_AUTH_PORT=7102
export JWT_SECRET=dev-jwt-secret-minimum-32-characters-long-for-development-only
# API 7102 → DB 5102 (change first digit: 7 → 5)
export DATABASE_URL_AUTH=postgresql://postgres:postgres@localhost:5102/workix_auth
export SERVICE_KEY=dev-service-key-minimum-32-characters-long-for-development-only

cd "$(dirname "$0")"
npx tsx --tsconfig ../../tsconfig.base.json src/main.ts
