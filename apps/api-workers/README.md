# Workers Service

Microservice for managing virtual workers and worker execution.

## Overview

Handles virtual worker creation, updates, deletion, and execution management.

## Port

- **Port**: `7107`
- **Database Port**: `5107` (API 7107 → DB 5107)
- **Database Name**: `workix_workers`
- **Connection**: `postgresql://postgres:postgres@localhost:5107/workix_workers`
- **Swagger**: `http://localhost:7107/docs`
- **Health**: `http://localhost:7107/health`

## Features

- Worker CRUD operations
- Worker execution management
- Event-Driven subscriber for async processing
- Worker templates

## API Endpoints

- `GET /api-workers/v1/workers` - List workers
- `POST /api-workers/v1/workers` - Create worker
- `GET /api-workers/v1/workers/:id` - Get worker
- `PUT /api-workers/v1/workers/:id` - Update worker
- `DELETE /api-workers/v1/workers/:id` - Delete worker

## Event-Driven Communication

Subscribes to `worker.*` events from API Gateway:
- `worker.create.request` - Create worker
- `worker.update.request` - Update worker
- `worker.delete.request` - Delete worker

## Database Schema

- `Worker` - Worker configuration
- `WorkerExecution` - Worker execution history

## Environment Variables

See `env.example` for all configuration options.

## Related

- [API Gateway](../api-gateway/README.md)
- [Port Configuration](../../.specify/specs-optimized/architecture/ports.md)
