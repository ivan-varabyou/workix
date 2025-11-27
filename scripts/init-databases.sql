-- Initialize all microservice databases
-- This script is executed when PostgreSQL container starts
-- Note: Separate databases are created via POSTGRES_DB in docker-compose.yml
-- This script is for the main postgres container only (if needed)

-- PostgreSQL doesn't support IF NOT EXISTS for CREATE DATABASE
-- We use a shell-like approach with SELECT and CREATE
-- Note: This will show errors if databases already exist, but that's acceptable

-- Create databases (will fail silently if they already exist)
SELECT 'CREATE DATABASE workix_monolith'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'workix_monolith')\gexec

SELECT 'CREATE DATABASE workix_auth'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'workix_auth')\gexec

SELECT 'CREATE DATABASE workix_gateway'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'workix_gateway')\gexec

SELECT 'CREATE DATABASE workix_notifications'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'workix_notifications')\gexec

SELECT 'CREATE DATABASE workix_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'workix_user')\gexec

SELECT 'CREATE DATABASE workix_pipeline'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'workix_pipeline')\gexec

SELECT 'CREATE DATABASE workix_rbac'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'workix_rbac')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE workix_monolith TO postgres;
GRANT ALL PRIVILEGES ON DATABASE workix_gateway TO postgres;
GRANT ALL PRIVILEGES ON DATABASE workix_auth TO postgres;
GRANT ALL PRIVILEGES ON DATABASE workix_notifications TO postgres;
GRANT ALL PRIVILEGES ON DATABASE workix_user TO postgres;
GRANT ALL PRIVILEGES ON DATABASE workix_pipeline TO postgres;
GRANT ALL PRIVILEGES ON DATABASE workix_rbac TO postgres;

-- Set default timezone
ALTER DATABASE workix_monolith SET timezone = 'UTC';
ALTER DATABASE workix_gateway SET timezone = 'UTC';
ALTER DATABASE workix_auth SET timezone = 'UTC';
ALTER DATABASE workix_notifications SET timezone = 'UTC';
ALTER DATABASE workix_user SET timezone = 'UTC';
ALTER DATABASE workix_pipeline SET timezone = 'UTC';
ALTER DATABASE workix_rbac SET timezone = 'UTC';

-- Create extensions (if needed in future)
-- These are run in the default postgres database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log successful initialization
\echo '✅ All databases initialized successfully'
