#!/bin/bash
# Script to run tests with real database
# Usage: ./scripts/test-with-db.sh [security|integration|all]

set -e

# Default to 'all' if no argument provided
TEST_TYPE=${1:-all}

# Database configuration
export DATABASE_URL_AUTH_TEST="postgresql://postgres:postgres@localhost:5437/workix_auth_test"
export USE_REAL_DB_FOR_SECURITY_TESTS="true"

# Check if test database is running
if ! docker ps | grep -q "workix-postgres-test-auth"; then
  echo "⚠️  Test database is not running. Starting it..."
  docker-compose -f ../../docker-compose.test-auth.yml up -d
  echo "⏳ Waiting for database to be ready..."
  sleep 5
fi

# Run tests based on type
case $TEST_TYPE in
  security)
    echo "🧪 Running security tests with real database..."
    nx test api-auth --testPathPattern="security" --run
    ;;
  integration)
    echo "🧪 Running integration tests with real database..."
    nx test api-auth --testPathPattern="integration" --run
    ;;
  all)
    echo "🧪 Running all tests with real database..."
    nx test api-auth --run
    ;;
  *)
    echo "❌ Unknown test type: $TEST_TYPE"
    echo "Usage: ./scripts/test-with-db.sh [security|integration|all]"
    exit 1
    ;;
esac

