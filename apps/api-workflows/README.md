# Workflows Service

Microservice for managing workflows and workflow execution.

## Overview

Handles workflow creation, updates, deletion, and execution tracking.

## Port

- **Port**: `7106`
- **Database Port**: `5106` (API 7106 → DB 5106)
- **Database Name**: `workix_workflows`
- **Connection**: `postgresql://postgres:postgres@localhost:5106/workix_workflows`
- **Swagger**: `http://localhost:7106/docs`
- **Health**: `http://localhost:7106/health`

## Features

- Workflow CRUD operations
- Workflow execution tracking
- Event-Driven subscriber for async processing
- Workflow templates

## API Endpoints

- `GET /api-workflows/v1/workflows` - List workflows
- `POST /api-workflows/v1/workflows` - Create workflow
- `GET /api-workflows/v1/workflows/:id` - Get workflow
- `PUT /api-workflows/v1/workflows/:id` - Update workflow
- `DELETE /api-workflows/v1/workflows/:id` - Delete workflow

## Event-Driven Communication

Subscribes to `workflow.*` events from API Gateway:
- `workflow.create.request` - Create workflow
- `workflow.update.request` - Update workflow
- `workflow.delete.request` - Delete workflow

## Database Schema

- `Workflow` - Workflow configuration
- `WorkflowExecution` - Workflow execution history

## Environment Variables

See `env.example` for all configuration options.

## Related

- [API Gateway](../api-gateway/README.md)
- [Port Configuration](../../.specify/specs-optimized/architecture/ports.md)
