# Webhooks Service

Microservice for managing webhooks and webhook event delivery.

## Overview

Handles webhook creation, updates, deletion, and asynchronous event delivery with retry logic.

## Port

- **Port**: `7105`
- **Database Port**: `5105` (API 7105 → DB 5105)
- **Database Name**: `workix_webhooks`
- **Connection**: `postgresql://postgres:postgres@localhost:5105/workix_webhooks`
- **Swagger**: `http://localhost:7105/docs`
- **Health**: `http://localhost:7105/health`

## Features

- Webhook CRUD operations
- Event delivery with retry logic
- Event-Driven subscriber for async processing
- Webhook event history tracking

## API Endpoints

- `GET /api-webhooks/v1/webhooks` - List webhooks
- `POST /api-webhooks/v1/webhooks` - Create webhook
- `GET /api-webhooks/v1/webhooks/:id` - Get webhook
- `PUT /api-webhooks/v1/webhooks/:id` - Update webhook
- `DELETE /api-webhooks/v1/webhooks/:id` - Delete webhook

## Event-Driven Communication

Subscribes to `webhook.*` events from API Gateway:
- `webhook.create.request` - Create webhook
- `webhook.update.request` - Update webhook
- `webhook.delete.request` - Delete webhook

## Database Schema

- `Webhook` - Webhook configuration
- `WebhookEvent` - Webhook event delivery history

## Environment Variables

See `env.example` for all configuration options.

## Related

- [API Gateway](../api-gateway/README.md)
- [Port Configuration](../../.specify/specs-optimized/architecture/ports.md)
