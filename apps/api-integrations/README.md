# Integrations Service

Microservice for managing integrations with external services.

## Overview

Handles integration provider management, credential management, and integration event tracking.

## Port

- **Port**: `7110`
- **Database Port**: `5110` (API 7110 → DB 5110)
- **Database Name**: `workix_integrations`
- **Connection**: `postgresql://postgres:postgres@localhost:5110/workix_integrations`
- **Swagger**: `http://localhost:7110/docs`
- **Health**: `http://localhost:7110/health`

## Features

- Integration provider CRUD operations
- Credential management (encrypted)
- Integration event tracking
- Event-Driven subscriber for async processing
- Support for multiple integration types:
  - Cloud providers (AWS, Azure, GCP)
  - Code platforms (GitHub, GitLab)
  - Communication (Slack, Telegram)
  - E-commerce (Amazon, eBay, Ozon, Wildberries)
  - Social media (YouTube, TikTok, Instagram)
  - Project management (Jira, Salesforce)

## API Endpoints

- `GET /api-integrations/v1/integrations/providers` - List integration providers
- `POST /api-integrations/v1/integrations/providers` - Create integration provider
- `GET /api-integrations/v1/integrations/providers/:id` - Get integration provider
- `PUT /api-integrations/v1/integrations/providers/:id` - Update integration provider
- `DELETE /api-integrations/v1/integrations/providers/:id` - Delete integration provider

## Event-Driven Communication

Subscribes to `integration.*` events from API Gateway for async processing.

## Database Schema

- `IntegrationProvider` - Integration provider configuration
- `IntegrationEvent` - Integration event tracking

## Environment Variables

See `env.example` for all configuration options.

## Related

- [API Gateway](../api-gateway/README.md)
- [Port Configuration](../../.specify/specs-optimized/architecture/ports.md)
- [Integrations Architecture](../../.specify/specs-optimized/architecture/integrations.md)
