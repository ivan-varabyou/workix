/**
 * Frontend API Client
 * High-level API client for frontend applications
 */

import type { HttpClient, HttpClientConfig, HttpResponse } from './http-client';

export interface ApiClientConfig extends HttpClientConfig {
  baseUrl: string;
  apiKey?: string;
  apiVersion?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown,
    message?: string
  ) {
    super(message ?? `API request failed with status ${status}`);
    this.name = 'ApiClientError';
  }
}

export class ApiClient {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly config: ApiClientConfig
  ) {}

  /**
   * Make GET request
   */
  async get<T = unknown>(endpoint: string, config?: HttpClientConfig): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await this.httpClient.get<T>(url, {
      ...this.buildHeaders(),
      ...config,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Make POST request
   */
  async post<T = unknown>(endpoint: string, data?: unknown, config?: HttpClientConfig): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await this.httpClient.post<T>(url, data, {
      ...this.buildHeaders(),
      ...config,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Make PUT request
   */
  async put<T = unknown>(endpoint: string, data?: unknown, config?: HttpClientConfig): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await this.httpClient.put<T>(url, data, {
      ...this.buildHeaders(),
      ...config,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Make PATCH request
   */
  async patch<T = unknown>(endpoint: string, data?: unknown, config?: HttpClientConfig): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await this.httpClient.patch<T>(url, data, {
      ...this.buildHeaders(),
      ...config,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Make DELETE request
   */
  async delete<T = unknown>(endpoint: string, config?: HttpClientConfig): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await this.httpClient.delete<T>(url, {
      ...this.buildHeaders(),
      ...config,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    const version = this.config.apiVersion ? `/${this.config.apiVersion}` : '';
    return `${this.config.baseUrl}${version}${endpoint}`;
  }

  /**
   * Build headers with API key if provided
   */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  /**
   * Handle response and throw error if status is not OK
   */
  private handleResponse<T>(response: HttpResponse<T>): T {
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }

    throw new ApiClientError(
      response.status,
      undefined,
      response.data,
      `API request failed with status ${response.status}`
    );
  }
}
