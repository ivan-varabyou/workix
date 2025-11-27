/**
 * API Reference Resource
 *
 * Provides complete API documentation to AI agents
 */

import { MCPResource } from '../types.js';

export function getApiReferenceResource(): MCPResource {
  return {
    uri: 'workix://api-reference',
    name: 'API Reference',
    description: 'Complete Workix API documentation',
    mimeType: 'text/markdown',
    getContent: () => `
# Workix API Reference

## Base URL
\`http://localhost:7000/api\`

## Authentication
JWT Bearer token required for most endpoints

### Login
\`\`\`
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "role": "user"
  }
}
\`\`\`

### Register
\`\`\`
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password",
  "name": "John Doe"
}

Response:
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "createdAt": "2025-11-06T00:00:00Z"
}
\`\`\`

## Users

### Get User
\`\`\`
GET /users/:id
Authorization: Bearer <token>

Response:
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "createdAt": "2025-11-06T00:00:00Z"
}
\`\`\`

### List Users
\`\`\`
GET /users?page=1&limit=10
Authorization: Bearer <token>

Response:
{
  "data": [...],
  "total": 50,
  "page": 1,
  "limit": 10
}
\`\`\`

## Pipelines

### Create Pipeline
\`\`\`
POST /pipelines
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Pipeline",
  "description": "Pipeline description",
  "steps": [
    {
      "id": "step_1",
      "name": "Step 1",
      "action": "process"
    }
  ]
}

Response:
{
  "id": "pipeline_123",
  "name": "My Pipeline",
  "createdAt": "2025-11-06T00:00:00Z"
}
\`\`\`

### Execute Pipeline
\`\`\`
POST /pipelines/:id/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "input": {
    "data": "input_data"
  }
}

Response:
{
  "executionId": "exec_123",
  "status": "running",
  "startedAt": "2025-11-06T00:00:00Z"
}
\`\`\`

### Get Pipeline Status
\`\`\`
GET /pipelines/:id/status
Authorization: Bearer <token>

Response:
{
  "id": "pipeline_123",
  "status": "completed",
  "progress": 100,
  "startedAt": "2025-11-06T00:00:00Z",
  "completedAt": "2025-11-06T00:05:00Z"
}
\`\`\`

## Health

### Health Check
\`\`\`
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2025-11-06T00:00:00Z"
}
\`\`\`

---

TODO: Add more endpoints as they are developed
    `,
  };
}
