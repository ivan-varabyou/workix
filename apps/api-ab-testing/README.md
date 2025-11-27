# A/B Testing Service

Microservice for A/B testing engine and test analytics.

## Overview

Handles A/B test creation, event tracking, and test analytics.

## Port

- **Port**: `7108`
- **Database Port**: `5108` (API 7108 → DB 5108)
- **Database Name**: `workix_ab_testing`
- **Connection**: `postgresql://postgres:postgres@localhost:5108/workix_ab_testing`
- **Swagger**: `http://localhost:7108/docs`
- **Health**: `http://localhost:7108/health`

## Features

- A/B test creation and management
- Event tracking
- Test analytics
- Test pause/resume
- Event-Driven subscriber for async processing

## API Endpoints

- `GET /api-ab-testing/v1/ab-tests` - List A/B tests
- `POST /api-ab-testing/v1/ab-tests` - Create A/B test
- `GET /api-ab-testing/v1/ab-tests/:id` - Get A/B test
- `PUT /api-ab-testing/v1/ab-tests/:id` - Update A/B test
- `DELETE /api-ab-testing/v1/ab-tests/:id` - Delete A/B test
- `POST /api-ab-testing/v1/ab-tests/:id/track` - Track event
- `POST /api-ab-testing/v1/ab-tests/:id/end` - End test
- `POST /api-ab-testing/v1/ab-tests/:id/pause` - Pause test
- `POST /api-ab-testing/v1/ab-tests/:id/resume` - Resume test

## Event-Driven Communication

Subscribes to `ab-test.*` events from API Gateway:
- `ab-test.create.request` - Create A/B test
- `ab-test.track-event.request` - Track event
- `ab-test.end.request` - End test
- `ab-test.pause.request` - Pause test
- `ab-test.resume.request` - Resume test

## Database Schema

- `ABTest` - A/B test configuration
- `ABTestEvent` - A/B test event tracking

## Environment Variables

See `env.example` for all configuration options.

## Related

- [API Gateway](../api-gateway/README.md)
- [Port Configuration](../../.specify/specs-optimized/architecture/ports.md)
