/**
 * Database Schema Resource
 *
 * Provides database schema information
 */

import { MCPResource } from '../types.js';

export function getSchemaResource(): MCPResource {
  return {
    uri: 'workix://schema',
    name: 'Database Schema',
    description: 'Workix database schema and relationships',
    mimeType: 'text/markdown',
    getContent: () => `
# Workix Database Schema

## Tables

### Users

User accounts and authentication

\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
\`\`\`

**Fields:**
- \`id\`: Unique identifier (UUID)
- \`email\`: Email address (unique, required)
- \`password_hash\`: Hashed password
- \`name\`: User full name
- \`role\`: User role (admin, user, guest)
- \`is_active\`: Account status
- \`created_at\`: Creation timestamp
- \`updated_at\`: Last update timestamp
- \`deleted_at\`: Soft delete timestamp

---

### Pipelines

Pipeline definitions and configurations

\`\`\`sql
CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  config JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Indexes
CREATE INDEX idx_pipelines_user_id ON pipelines(user_id);
CREATE INDEX idx_pipelines_created_at ON pipelines(created_at);
\`\`\`

**Fields:**
- \`id\`: Unique identifier
- \`user_id\`: Pipeline owner (foreign key to users)
- \`name\`: Pipeline name
- \`description\`: Pipeline description
- \`config\`: JSONB configuration (steps, triggers, etc.)
- \`is_active\`: Active status
- \`created_at\`: Creation timestamp
- \`updated_at\`: Last update timestamp
- \`deleted_at\`: Soft delete timestamp

---

### Pipeline Steps

Individual steps within pipelines

\`\`\`sql
CREATE TABLE pipeline_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID NOT NULL REFERENCES pipelines(id),
  order_index INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  config JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_pipeline_steps_pipeline_id ON pipeline_steps(pipeline_id);
\`\`\`

**Fields:**
- \`id\`: Unique identifier
- \`pipeline_id\`: Parent pipeline (foreign key)
- \`order_index\`: Step execution order
- \`name\`: Step name
- \`action\`: Step action type
- \`config\`: JSONB step configuration
- \`created_at\`: Creation timestamp
- \`updated_at\`: Last update timestamp

---

### Executions

Pipeline execution records

\`\`\`sql
CREATE TABLE executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID NOT NULL REFERENCES pipelines(id),
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  input JSONB,
  output JSONB,
  error TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_executions_pipeline_id ON executions(pipeline_id);
CREATE INDEX idx_executions_user_id ON executions(user_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_created_at ON executions(created_at);
\`\`\`

**Fields:**
- \`id\`: Execution identifier
- \`pipeline_id\`: Pipeline being executed
- \`user_id\`: User who triggered execution
- \`status\`: Execution status (pending, running, completed, failed)
- \`input\`: JSONB input data
- \`output\`: JSONB execution results
- \`error\`: Error message if failed
- \`started_at\`: Execution start time
- \`completed_at\`: Execution end time
- \`created_at\`: Creation timestamp

---

### Audit Log

Audit trail for all actions

\`\`\`sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
\`\`\`

---

## Relationships

\`\`\`
users (1) ──→ (n) pipelines
users (1) ──→ (n) executions
pipelines (1) ──→ (n) executions
pipelines (1) ──→ (n) pipeline_steps
\`\`\`

---

## Enums

### User Roles
- \`admin\` - Administrator with full access
- \`user\` - Regular user
- \`guest\` - Guest with limited access

### Execution Status
- \`pending\` - Waiting to start
- \`running\` - Currently executing
- \`completed\` - Successfully completed
- \`failed\` - Execution failed
- \`cancelled\` - User cancelled

---

## TODO

This is the base schema. As features are developed:
- Add indexes for common queries
- Add constraints for data validation
- Add triggers for audit logging
- Add materialized views for analytics

    `,
  };
}
