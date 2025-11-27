/**
 * AI Generation Tools
 *
 * Provides AI generation and processing capabilities
 */

import { MCPTool } from '../types.js';
import { makeApiRequest } from '../utils/api-client.js';

export function getAiTools(): MCPTool[] {
  return [
    {
      name: 'generate_text',
      description: 'Generate text content using AI',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'Text prompt for generation',
          },
          provider: {
            type: 'string',
            description: 'AI provider: openai, groq, anthropic, auto',
            enum: ['openai', 'groq', 'anthropic', 'auto'],
            default: 'auto',
          },
          model: {
            type: 'string',
            description: 'Specific model to use (optional)',
          },
          maxTokens: {
            type: 'number',
            description: 'Maximum tokens to generate',
            default: 1000,
          },
          temperature: {
            type: 'number',
            description: 'Temperature for generation (0.0-1.0)',
            default: 0.7,
          },
        },
        required: ['prompt'],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const result = await makeApiRequest('/api/v1/ai/generate/text', 'POST', {
            prompt: args.prompt,
            provider: args.provider || 'auto',
            model: args.model,
            maxTokens: args.maxTokens || 1000,
            temperature: args.temperature || 0.7,
          });
          return {
            success: true,
            prompt: args.prompt,
            provider: args.provider || 'auto',
            generation: result,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'generate_image',
      description: 'Generate image using AI',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'Image description prompt',
          },
          provider: {
            type: 'string',
            description: 'AI provider: openai, stability, auto',
            enum: ['openai', 'stability', 'auto'],
            default: 'auto',
          },
          size: {
            type: 'string',
            description: 'Image size',
            enum: ['256x256', '512x512', '1024x1024'],
            default: '512x512',
          },
          style: {
            type: 'string',
            description: 'Image style (optional)',
          },
        },
        required: ['prompt'],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const result = await makeApiRequest('/api/v1/ai/generate/image', 'POST', {
            prompt: args.prompt,
            provider: args.provider || 'auto',
            size: args.size || '512x512',
            style: args.style,
          });
          return {
            success: true,
            prompt: args.prompt,
            provider: args.provider || 'auto',
            generation: result,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'ai_providers_status',
      description: 'Check status of all AI providers',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
      handler: async () => {
        try {
          const result = await makeApiRequest('/api/v1/ai/providers/status', 'GET');
          return {
            success: true,
            providers: result,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'ai_metrics',
      description: 'Get AI usage metrics and costs',
      inputSchema: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            description: 'Time period: hour, day, week, month',
            enum: ['hour', 'day', 'week', 'month'],
            default: 'day',
          },
          provider: {
            type: 'string',
            description: 'Specific provider to get metrics for (optional)',
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const queryParams = new URLSearchParams();
          queryParams.append('period', (args.period as string) || 'day');
          if (args.provider) queryParams.append('provider', args.provider as string);

          const result = await makeApiRequest(`/api/v1/ai/metrics?${queryParams.toString()}`, 'GET');
          return {
            success: true,
            period: args.period || 'day',
            provider: args.provider || 'all',
            metrics: result,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
  ];
}
