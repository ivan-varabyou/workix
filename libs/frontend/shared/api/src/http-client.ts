/**
 * Frontend HTTP Client
 * HTTP client implementation for frontend (browser) environment
 */

export interface HttpClientConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface HttpClient {
  get<T = unknown>(url: string, config?: HttpClientConfig): Promise<HttpResponse<T>>;
  post<T = unknown>(url: string, data?: unknown, config?: HttpClientConfig): Promise<HttpResponse<T>>;
  put<T = unknown>(url: string, data?: unknown, config?: HttpClientConfig): Promise<HttpResponse<T>>;
  patch<T = unknown>(url: string, data?: unknown, config?: HttpClientConfig): Promise<HttpResponse<T>>;
  delete<T = unknown>(url: string, config?: HttpClientConfig): Promise<HttpResponse<T>>;
}

/**
 * Create HTTP client using Fetch API (browser)
 */
export function createHttpClient(config?: HttpClientConfig): HttpClient {
  const baseConfig: HttpClientConfig = {
    timeout: 30000,
    ...config,
  };

  return {
    async get<T>(url: string, config?: HttpClientConfig): Promise<HttpResponse<T>> {
      const fullUrl = baseConfig.baseUrl ? `${baseConfig.baseUrl}${url}` : url;
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...baseConfig.headers,
          ...config?.headers,
        },
      });

      const data = await response.json();
      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };
    },
    async post<T>(url: string, data?: unknown, config?: HttpClientConfig): Promise<HttpResponse<T>> {
      const fullUrl = baseConfig.baseUrl ? `${baseConfig.baseUrl}${url}` : url;
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...baseConfig.headers,
          ...config?.headers,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };
    },
    async put<T>(url: string, data?: unknown, config?: HttpClientConfig): Promise<HttpResponse<T>> {
      const fullUrl = baseConfig.baseUrl ? `${baseConfig.baseUrl}${url}` : url;
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...baseConfig.headers,
          ...config?.headers,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };
    },
    async patch<T>(url: string, data?: unknown, config?: HttpClientConfig): Promise<HttpResponse<T>> {
      const fullUrl = baseConfig.baseUrl ? `${baseConfig.baseUrl}${url}` : url;
      const response = await fetch(fullUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...baseConfig.headers,
          ...config?.headers,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };
    },
    async delete<T>(url: string, config?: HttpClientConfig): Promise<HttpResponse<T>> {
      const fullUrl = baseConfig.baseUrl ? `${baseConfig.baseUrl}${url}` : url;
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...baseConfig.headers,
          ...config?.headers,
        },
      });

      const responseData = await response.json().catch(() => ({}));
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };
    },
  };
}
