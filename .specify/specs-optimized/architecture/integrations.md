# Integrations Architecture

Universal integration framework for external services with provider-agnostic abstraction.

## Integration Core

**Location**: `libs/integrations/core/`

### Capabilities

- `ANALYTICS` - Metrics, performance analysis, retention curves
- `UPLOAD` - Content upload, bulk operations
- `CONTENT` - Content management
- `COMMENTS` - Comment management
- `LIVE` - Live streaming operations

### Core Services

- **IntegrationRouter** - Intelligent provider selection with failover
- **ProviderRegistry** - Provider registration and discovery
- **CredentialManager** - Secure credential storage and rotation
- **DataTransformer** - Universal data transformation
- **DataSyncService** - Synchronization between providers
- **EventLogger** - Integration event logging
- **AdapterBuilder** - Dynamic adapter creation
- **AdminApiManagement** - Admin API configuration

### Router Features

- Provider filtering by capability/operation
- Weighted scoring for provider selection
- Automatic failover on errors
- Parallel execution support
- Health checks
- Latency tracking
- Cost tracking

## Cloud Providers

**Location**: `libs/integrations/cloud/`

### AWS (`libs/integrations/cloud/aws/`)

**Services**: S3, Lambda, EC2

**Features**:
- S3 file upload/download
- Lambda function deployment/invocation
- EC2 instance management
- Infrastructure status monitoring

**Config**: S3Config, LambdaConfig, EC2Config

### Azure (`libs/integrations/cloud/azure/`)

**Services**: Blob Storage, Functions, Virtual Machines

**Features**:
- Blob storage operations
- Function deployment/invocation
- VM management
- Infrastructure monitoring

### GCP (`libs/integrations/cloud/gcp/`)

**Services**: Cloud Storage, Cloud Functions, Compute Engine

**Features**:
- Cloud Storage operations
- Cloud Function invocation
- Compute instance management
- Infrastructure status

## Code Platforms

**Location**: `libs/integrations/code/`

### GitHub (`libs/integrations/code/github/`)

**Services**:
- GitHubApiService - API operations
- GitHubEventsService - Webhook events
- GitHubIntegrationService - Integration management

**Features**:
- Repository management
- Webhook configuration
- Event processing
- Integration records

### GitLab (`libs/integrations/code/gitlab/`)

**Services**:
- GitLabApiService - API operations
- GitLabEventsService - Webhook events
- GitLabIntegrationService - Integration management

**Features**:
- Repository management
- Webhook configuration
- Event processing
- Integration records

## Communication

**Location**: `libs/integrations/communication/`

### Slack (`libs/integrations/communication/slack/`)

**Features**:
- Message sending (text, blocks)
- Thread replies
- Event handling
- Interaction handling
- User management
- Channel management

**Config**: Bot token, signing secret, app ID, default channel

### Telegram (`libs/integrations/communication/telegram/`)

**Features**:
- Message sending
- Bot commands
- User management

## E-Commerce

**Location**: `libs/integrations/e-commerce/`

### Marketplaces (`libs/integrations/e-commerce/marketplaces/`)

#### Amazon (`amazon/`)

**Capabilities**: ANALYTICS, UPLOAD

**Operations**:
- Analytics: `getProductStats`, `getCategoryStats`, `getSellerMetrics`, `getSalesRank`
- Upload: `uploadProduct`, `updateProductInfo`, `bulkUpload`, `updateInventory`

#### eBay (`ebay/`)

**Capabilities**: ANALYTICS, UPLOAD

**Operations**: Product stats, seller metrics, product upload/update

#### Ozon (`ozon/`)

**Capabilities**: ANALYTICS, UPLOAD

**Operations**: Analytics and product management

#### Wildberries (`wildberries/`)

**Capabilities**: ANALYTICS, UPLOAD

**Operations**: Analytics and product management

### Social Commerce (`libs/integrations/e-commerce/social-commerce/`)

#### Instagram (`instagram/`)

**Capabilities**: ANALYTICS

**Operations**: Post analytics, engagement metrics

#### TikTok (`tiktok/`)

**Capabilities**: ANALYTICS

**Operations**: Video analytics, performance metrics

### Video Commerce (`libs/integrations/e-commerce/video-commerce/`)

#### YouTube (`youtube/`)

**Capabilities**: ANALYTICS, CONTENT, COMMENTS, LIVE

**Operations**: Video analytics, content management, comments, live streaming

### Shared Analytics (`libs/integrations/e-commerce/shared/analytics/`)

Universal analytics interfaces and data structures for all e-commerce providers.

## Project Management

**Location**: `libs/integrations/project-management/`

### Jira (`libs/integrations/project-management/jira/`)

**Services**:
- JiraApiService - API operations
- JiraEventsService - Webhook events
- JiraIntegrationService - Integration management

**Features**:
- Issue management
- Project tracking
- Webhook configuration
- Event processing

### Salesforce (`libs/integrations/project-management/salesforce/`)

**Services**:
- SalesforceApiService - API operations
- SalesforceIntegrationService - Integration management

**Features**:
- CRM operations
- Data synchronization
- Integration management

## MCP Integration

Model Context Protocol (MCP) integration for AI agent communication.

**Location**: `apps/mcp-server/`

### Setup

- MCP server configuration
- IDE integration
- Chrome DevTools integration

### Tools Registry

- Available MCP tools
- Tool usage examples
- Integration patterns

## Usage Pattern

```typescript
// Request integration
const request: IntegrationRequest = {
  capability: IntegrationCapability.ANALYTICS,
  operation: 'fetchMetrics',
  payload: { ... }
};

// Execute via router
const response = await integrationRouter.execute(request);

// Or with preferred providers
const response = await integrationRouter.execute(request, ['youtube', 'tiktok']);

// Parallel execution
const responses = await integrationRouter.executeParallel(request, 2);
```

## Related

- [Core Architecture](../core/architecture.md)
- [Development Process](../core/development.md)
- [AI Architecture](./ai.md)
