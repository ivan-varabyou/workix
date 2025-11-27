/**
 * Workix MCP Server
 *
 * Provides AI agents (Claude via Cursor/Windsurf) with:
 * - Tools: Methods to call (authenticate, create_pipeline, etc.)
 * - Resources: Documentation and schema
 * - Full project context
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { getApiEndpointsResource } from './resources/api-endpoints.resource.js';
// Import resources
import { getApiReferenceResource } from './resources/api-reference.resource.js';
import { getAppsStructureResource } from './resources/apps-structure.resource.js';
import { getArchitectureResource } from './resources/architecture.resource.js';
import { getArchitectureVisionResource } from './resources/architecture-vision.resource.js';
import { getDevelopmentProcessResource } from './resources/development-process.resource.js';
import { getDevelopmentRulesResource } from './resources/development-rules.resource.js';
import { getLibsStructureResource } from './resources/libs-structure.resource.js';
import { getSchemaResource } from './resources/schema.resource.js';
import { getSpecsIndexResource } from './resources/specs-index.resource.js';
import { getTasksResource } from './resources/tasks.resource.js';
import { getTestingGuideResource } from './resources/testing-guide.resource.js';
import { getGitWorkflowResource } from './resources/git-workflow.resource.js';
import { getMcpServersResource } from './resources/mcp-servers.resource.js';
import { getFrontendResource } from './resources/frontend.resource.js';
import { getAiResource } from './resources/ai.resource.js';
import { getCodeReviewResource } from './resources/code-review.resource.js';
import { getPlatformResource } from './resources/platform.resource.js';
import { getSecurityResource } from './resources/security.resource.js';
import { getApiGatewayResource } from './resources/api-gateway.resource.js';
// Import tools
import { getAuthTools } from './tools/auth.tools.js';
import { getHealthTools } from './tools/health.tools.js';
import { getPipelineTools } from './tools/pipelines.tools.js';
import { getProjectTools } from './tools/project.tools.js';
import { getUserTools } from './tools/users.tools.js';
import { getNxTools } from './tools/nx.tools.js';
import { getPackageTools } from './tools/package.tools.js';
import { getDatabaseTools } from './tools/database.tools.js';
import { getRbacTools } from './tools/rbac.tools.js';
import { getQualityTools } from './tools/quality.tools.js';
import { getDockerTools } from './tools/docker.tools.js';
import { getWorkerTools } from './tools/workers.tools.js';
import { getIntegrationTools } from './tools/integrations.tools.js';
import { getAiTools } from './tools/ai.tools.js';

// Collect all tools
const allTools: any[] = [
  ...getAuthTools(),
  ...getUserTools(),
  ...getPipelineTools(),
  ...getHealthTools(),
  ...getProjectTools(),
  ...getNxTools(),
  ...getPackageTools(),
  ...getDatabaseTools(),
  ...getRbacTools(),
  ...getQualityTools(),
  ...getDockerTools(),
  ...getWorkerTools(),
  ...getIntegrationTools(),
  ...getAiTools(),
];

// Collect all resources
const allResources: any[] = [
  getApiReferenceResource(),
  getArchitectureResource(),
  getSchemaResource(),
  getDevelopmentRulesResource(),
  getArchitectureVisionResource(),
  getTasksResource(),
  getApiEndpointsResource(),
  getSpecsIndexResource(),
  getTestingGuideResource(),
  getDevelopmentProcessResource(),
  getLibsStructureResource(),
  getAppsStructureResource(),
  getGitWorkflowResource(),
  getMcpServersResource(),
  getFrontendResource(),
  getAiResource(),
  getCodeReviewResource(),
  getPlatformResource(),
  getSecurityResource(),
  getApiGatewayResource(),
];

// Initialize MCP Server
const server = new Server({
  name: 'workix-mcp-server',
  version: '1.0.0',
  capabilities: {
    tools: {},
    resources: {},
  },
});

// Handle ListTools request
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  })),
}));

// Handle CallTool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = allTools.find((t) => t.name === request.params.name);

  if (!tool) {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  try {
    const result: any = await tool.handler(request.params.arguments || {});
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage: any = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Handle ListResources request
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: allResources.map((resource) => ({
    uri: resource.uri,
    name: resource.name,
    description: resource.description,
    mimeType: resource.mimeType,
  })),
}));

// Handle ReadResource request
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const resource = allResources.find((r) => r.uri === request.params.uri);

  if (!resource) {
    throw new Error(`Unknown resource: ${request.params.uri}`);
  }

  try {
    const content: any = await resource.getContent();
    return {
      contents: [
        {
          type: 'text',
          text: content,
          mimeType: resource.mimeType,
        },
      ],
    };
  } catch (error) {
    const errorMessage: any = error instanceof Error ? error.message : String(error);
    return {
      contents: [
        {
          type: 'text',
          text: `Error loading resource: ${errorMessage}`,
          mimeType: 'text/plain',
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main(): Promise<void> {
  const transport: any = new StdioServerTransport();
  await server.connect(transport);
  console.error('Workix MCP Server started');
}

main().catch((error) => {
  console.error('Failed to start Workix MCP Server:', error);
  process.exit(1);
});
