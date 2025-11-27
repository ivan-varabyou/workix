/**
 * MCP Tools Registry
 *
 * Central registry of all available tools for AI agents
 * Auto-generated / manually maintained list of all tools
 */

export const toolsRegistry = {
  authentication: {
    category: 'Authentication & Authorization',
    tools: [
      {
        name: 'authenticate_user',
        description: 'Authenticate user with email and password',
        implemented: true,
      },
      {
        name: 'create_user',
        description: 'Register a new user',
        implemented: true,
      },
      {
        name: 'verify_token',
        description: 'Verify JWT token validity',
        implemented: true,
      },
      {
        name: 'refresh_token',
        description: 'Get new access token using refresh token',
        implemented: true,
      },
    ],
  },

  users: {
    category: 'User Management',
    tools: [
      {
        name: 'get_user',
        description: 'Get user information by ID',
        implemented: true,
      },
      {
        name: 'list_users',
        description: 'List all users with pagination',
        implemented: true,
      },
      {
        name: 'update_user',
        description: 'Update user information',
        implemented: true,
      },
      {
        name: 'delete_user',
        description: 'Delete user',
        implemented: true,
      },
      {
        name: 'get_user_role',
        description: 'Get user role and permissions',
        implemented: true,
      },
    ],
  },

  pipelines: {
    category: 'Pipeline Management',
    tools: [
      {
        name: 'create_pipeline',
        description: 'Create a new pipeline',
        implemented: true,
      },
      {
        name: 'get_pipeline',
        description: 'Get pipeline details',
        implemented: true,
      },
      {
        name: 'list_pipelines',
        description: 'List all pipelines',
        implemented: true,
      },
      {
        name: 'execute_pipeline',
        description: 'Execute a pipeline',
        implemented: true,
      },
      {
        name: 'get_pipeline_status',
        description: 'Get pipeline execution status',
        implemented: true,
      },
      {
        name: 'update_pipeline',
        description: 'Update pipeline configuration',
        implemented: true,
      },
      {
        name: 'delete_pipeline',
        description: 'Delete a pipeline',
        implemented: true,
      },
    ],
  },

  health: {
    category: 'Health & System',
    tools: [
      {
        name: 'check_api_health',
        description: 'Check API health status',
        implemented: true,
      },
      {
        name: 'get_system_status',
        description: 'Get overall system status',
        implemented: true,
      },
      {
        name: 'get_api_version',
        description: 'Get API version',
        implemented: true,
      },
    ],
  },

  project: {
    category: 'Project Information',
    tools: [
      {
        name: 'get_api_documentation',
        description: 'Get complete API documentation',
        implemented: true,
      },
      {
        name: 'get_project_architecture',
        description: 'Get project architecture overview',
        implemented: true,
      },
      {
        name: 'get_database_schema',
        description: 'Get database schema information',
        implemented: true,
      },
      {
        name: 'list_available_endpoints',
        description: 'List all available API endpoints',
        implemented: true,
      },
    ],
  },
};

/**
 * Summary statistics
 */
export const getRegistryStats = () => {
  let totalTools = 0;
  let implementedTools = 0;

  Object.values(toolsRegistry).forEach((category) => {
    category.tools.forEach((tool) => {
      totalTools++;
      if (tool.implemented) {
        implementedTools++;
      }
    });
  });

  return {
    totalTools,
    implementedTools,
    pendingTools: totalTools - implementedTools,
    completionPercentage: Math.round((implementedTools / totalTools) * 100),
  };
};

/**
 * Get tools by category
 */
export const getToolsByCategory = (category: string) => {
  const cat: any = toolsRegistry[category as keyof typeof toolsRegistry];
  return cat ? cat.tools : [];
};

/**
 * Tool Registry Entry
 */
export interface ToolRegistryEntry {
  name: string;
  description: string;
  implemented: boolean;
}

/**
 * Get all implemented tools
 */
export const getImplementedTools = (): ToolRegistryEntry[] => {
  const implemented: ToolRegistryEntry[] = [];
  Object.values(toolsRegistry).forEach((category) => {
    category.tools.forEach((tool) => {
      if (tool.implemented) {
        implemented.push(tool);
      }
    });
  });
  return implemented;
};

/**
 * Get all pending tools
 */
export const getPendingTools = (): ToolRegistryEntry[] => {
  const pending: ToolRegistryEntry[] = [];
  Object.values(toolsRegistry).forEach((category) => {
    category.tools.forEach((tool) => {
      if (!tool.implemented) {
        pending.push(tool);
      }
    });
  });
  return pending;
};
