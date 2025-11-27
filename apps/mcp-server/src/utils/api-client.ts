/**
 * API Client for MCP Tools
 *
 * Centralized HTTP client for making requests to Workix API
 */

import axios, { AxiosInstance } from 'axios';

const API_URL: string = process.env.API_URL || 'http://localhost:7100/api';
const API_TOKEN: string = process.env.API_TOKEN || '';

/**
 * Create API client instance
 */
export function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response) {
        // Server responded with error
        throw new Error(
          `API Error: ${error.response.status} - ${error.response.data?.message || error.message}`
        );
      } else if (error.request) {
        // Request made but no response
        throw new Error(`API Error: No response from server - ${error.message}`);
      } else {
        // Error setting up request
        throw new Error(`API Error: ${error.message}`);
      }
    }
  );

  return client;
}

/**
 * Default API client instance
 */
export const apiClient: any = createApiClient();

/**
 * Make API request helper
 */
export async function makeApiRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<any> {
  try {
    const client = createApiClient();
    const response = await client.request({
      url: endpoint,
      method,
      data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
