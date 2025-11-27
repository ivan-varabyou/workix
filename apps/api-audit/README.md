# Audit Service

Microservice for centralized audit logging and compliance tracking.

## Overview

Handles audit log collection, compliance tracking, and security auditing.

## Port

- **Port**: `7109`
- **Database Port**: `5109` (API 7109 → DB 5109)
- **Database Name**: `workix_audit`
- **Connection**: `postgresql://postgres:postgres@localhost:5109/workix_audit`
- **Swagger**: `http://localhost:7109/docs`
- **Health**: `http://localhost:7109/health`

## Features

- Audit log collection
- Compliance tracking
- Security auditing
- Event-Driven subscriber for async processing
- Audit log filtering and search

## API Endpoints

- `GET /api-audit/v1/audit-logs` - List audit logs (with filters)
- `GET /api-audit/v1/audit-logs/:id` - Get audit log by ID

## Event-Driven Communication

Subscribes to `audit.*` events from API Gateway:
- `audit.log` - Create audit log entry

## Database Schema

- `AuditLog` - Audit log entries

## Environment Variables

See `env.example` for all configuration options.

## Related

- [API Gateway](../api-gateway/README.md)
- [Port Configuration](../../.specify/specs-optimized/architecture/ports.md)
