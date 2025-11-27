import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Inject, inject, Injectable, Optional } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { RequestBody } from '../interfaces/api-client.interface';

/**
 * API Client Service
 * Centralized service for all API requests
 *
 * Features:
 * - Automatic versioning (/api/v1/)
 * - Application ID header (X-Application-Id)
 * - API Key header (X-API-Key)
 * - Error handling
 * - Request/Response interceptors
 */
export interface ApiRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?:
    | HttpParams
    | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  observe?: 'body' | 'events' | 'response';
}

export interface ApiClientConfig {
  apiUrl: string;
  apiVersion: string;
  applicationId: string;
  apiKey?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl: string;
  private readonly apiVersion: string;
  private readonly applicationId: string;
  private readonly apiKey: string;

  constructor(@Optional() @Inject('API_CONFIG') config?: ApiClientConfig) {
    // Use config if provided, otherwise throw error (must be provided)
    if (!config) {
      throw new Error(
        'API_CONFIG must be provided. Use provideApiClientConfig() in your app config.'
      );
    }

    this.baseUrl = config.apiUrl;
    this.apiVersion = config.apiVersion;
    this.applicationId = config.applicationId;
    this.apiKey = config.apiKey || '';
  }

  /**
   * Get full API URL with versioning
   */
  private getApiUrl(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    // If endpoint already includes /api/v1/, use as is
    if (cleanEndpoint.startsWith('api/v')) {
      return `${this.baseUrl}/${cleanEndpoint}`;
    }

    // Otherwise, add version prefix
    return `${this.baseUrl}/api/${this.apiVersion}/${cleanEndpoint}`;
  }

  /**
   * Get default headers with Application ID and API Key
   */
  private getDefaultHeaders(
    additionalHeaders?: HttpHeaders | { [header: string]: string | string[] }
  ): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Application-Id': this.applicationId,
    });

    // Add API Key if provided
    if (this.apiKey) {
      headers = headers.set('X-API-Key', this.apiKey);
    }

    // Merge additional headers
    if (additionalHeaders) {
      if (additionalHeaders instanceof HttpHeaders) {
        additionalHeaders.keys().forEach((key) => {
          const values = additionalHeaders.getAll(key);
          if (values) {
            values.forEach((value) => {
              headers = headers.append(key, value);
            });
          }
        });
      } else {
        Object.keys(additionalHeaders).forEach((key) => {
          const value = additionalHeaders[key];
          if (value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach((v) => {
                headers = headers.append(key, v);
              });
            } else {
              headers = headers.set(key, value);
            }
          }
        });
      }
    }

    return headers;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage =
        error.error?.message ||
        error.message ||
        `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    const url = this.getApiUrl(endpoint);
    const headers = this.getDefaultHeaders(options?.headers);
    const params =
      options?.params instanceof HttpParams
        ? options.params
        : options?.params
        ? new HttpParams({ fromObject: options.params })
        : undefined;

    const responseType = options?.responseType || 'json';
    const observe = options?.observe || 'body';

    if (responseType === 'arraybuffer') {
      // For arraybuffer, HttpClient has specific overloads
      // We need to construct the options object correctly to match HttpClient overloads
      const arrayBufferRequestOptions: {
        headers?: HttpHeaders | { [header: string]: string | string[] };
        params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
        responseType: 'arraybuffer';
        observe?: 'body' | 'events' | 'response';
      } = {
        headers,
        responseType: 'arraybuffer',
        observe,
      };
      if (params !== undefined) {
        arrayBufferRequestOptions.params = params;
      }
      // HttpClient.get with responseType: 'arraybuffer' returns Observable<ArrayBuffer>
      // We need to use the correct overload signature
      // TypeScript cannot infer the correct overload, so we need to help it
      // For arraybuffer, we need to use the correct HttpClient overload
      // HttpClient.get with responseType: 'arraybuffer' has a specific overload signature
      const httpOptions: {
        headers?: HttpHeaders | { [header: string]: string | string[] };
        params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
        responseType: 'arraybuffer';
        observe?: 'body' | 'events' | 'response';
      } = {
        responseType: 'arraybuffer',
      };
      if (arrayBufferRequestOptions.headers !== undefined) {
        httpOptions.headers = arrayBufferRequestOptions.headers;
      }
      if (arrayBufferRequestOptions.params !== undefined) {
        httpOptions.params = arrayBufferRequestOptions.params;
      }
      if (arrayBufferRequestOptions.observe !== undefined) {
        httpOptions.observe = arrayBufferRequestOptions.observe;
      }
      // For arraybuffer, use HttpClient.get directly with proper options
      // HttpClient.get with responseType: 'arraybuffer' returns Observable<ArrayBuffer>
      const arrayBufferOptions: {
        headers?: HttpHeaders | { [header: string]: string | string[] };
        params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
        responseType: 'arraybuffer';
        observe?: 'body';
      } = {
        responseType: 'arraybuffer',
        observe: 'body',
      };
      if (httpOptions.headers !== undefined) {
        arrayBufferOptions.headers = httpOptions.headers;
      }
      if (httpOptions.params !== undefined) {
        arrayBufferOptions.params = httpOptions.params;
      }
      // Use HttpClient.get directly - it has proper overloads for arraybuffer
      return (this.http.get(url, arrayBufferOptions) as Observable<ArrayBuffer>).pipe(
        catchError(this.handleError.bind(this)),
        map((value: ArrayBuffer) => value as T)
      ) as Observable<T>;
    }

    // Build request options for non-arraybuffer responses
    // Use explicit type to help TypeScript match the correct HttpClient overload
    const requestOptions: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
      responseType?: 'json' | 'text' | 'blob';
      observe?: 'body';
    } = {
      headers,
      observe: observe as 'body',
    };
    if (params !== undefined) {
      requestOptions.params = params;
    }
    if (responseType !== 'json') {
      requestOptions.responseType = responseType as 'text' | 'blob';
    }

    // TypeScript needs explicit typing for HttpClient overloads
    // Use type assertion to help TypeScript understand the return type
    return this.http.get(url, requestOptions as any).pipe(catchError(this.handleError.bind(this))) as Observable<T>;
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: RequestBody, options?: ApiRequestOptions): Observable<T> {
    const url = this.getApiUrl(endpoint);
    const headers = this.getDefaultHeaders(options?.headers);
    const params =
      options?.params instanceof HttpParams
        ? options.params
        : options?.params
        ? new HttpParams({ fromObject: options.params })
        : undefined;

    const responseType = options?.responseType || 'json';
    const observe = options?.observe || 'body';

    if (responseType === 'arraybuffer') {
      const arrayBufferRequestOptions: {
        headers?: HttpHeaders | { [header: string]: string | string[] };
        params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
        responseType: 'arraybuffer';
        observe?: 'body' | 'events' | 'response';
      } = {
        headers,
        responseType: 'arraybuffer',
        observe,
      };
      if (params !== undefined) {
        arrayBufferRequestOptions.params = params;
      }
      const httpOptions: {
        headers?: HttpHeaders | { [header: string]: string | string[] };
        params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
        responseType: 'arraybuffer';
        observe?: 'body' | 'events' | 'response';
      } = {
        responseType: 'arraybuffer',
      };
      if (arrayBufferRequestOptions.headers !== undefined) {
        httpOptions.headers = arrayBufferRequestOptions.headers;
      }
      if (arrayBufferRequestOptions.params !== undefined) {
        httpOptions.params = arrayBufferRequestOptions.params;
      }
      if (arrayBufferRequestOptions.observe !== undefined) {
        httpOptions.observe = arrayBufferRequestOptions.observe;
      }
      const arrayBufferOptions: {
        headers?: HttpHeaders | { [header: string]: string | string[] };
        params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
        responseType: 'arraybuffer';
        observe?: 'body';
      } = {
        responseType: 'arraybuffer',
        observe: 'body',
      };
      if (httpOptions.headers !== undefined) {
        arrayBufferOptions.headers = httpOptions.headers;
      }
      if (httpOptions.params !== undefined) {
        arrayBufferOptions.params = httpOptions.params;
      }
      return (this.http.post(url, body, arrayBufferOptions) as Observable<ArrayBuffer>).pipe(
        catchError(this.handleError.bind(this)),
        map((value: ArrayBuffer) => value as T)
      ) as Observable<T>;
    }

    // Build request options for non-arraybuffer responses
    // Use explicit type to help TypeScript match the correct HttpClient overload
    const requestOptions: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
      responseType?: 'json' | 'text' | 'blob';
      observe?: 'body';
    } = {
      headers,
      observe: observe as 'body',
    };
    if (params !== undefined) {
      requestOptions.params = params;
    }
    if (responseType !== 'json') {
      requestOptions.responseType = responseType as 'text' | 'blob';
    }

    // TypeScript needs explicit typing for HttpClient overloads
    // Use type assertion to help TypeScript understand the return type
    return this.http.post(url, body, requestOptions as any).pipe(catchError(this.handleError.bind(this))) as Observable<T>;
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: RequestBody, options?: ApiRequestOptions): Observable<T> {
    const url = this.getApiUrl(endpoint);
    const headers = this.getDefaultHeaders(options?.headers);
    const params =
      options?.params instanceof HttpParams
        ? options.params
        : options?.params
        ? new HttpParams({ fromObject: options.params })
        : undefined;

    const responseType = options?.responseType || 'json';
    const observe = options?.observe || 'body';

    if (responseType === 'arraybuffer') {
      const arrayBufferRequestOptions: {
        headers?: HttpHeaders | { [header: string]: string | string[] };
        params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
        responseType: 'arraybuffer';
        observe?: 'body' | 'events' | 'response';
      } = {
        headers,
        responseType: 'arraybuffer',
        observe,
      };
      if (params !== undefined) {
        arrayBufferRequestOptions.params = params;
      }
      const httpOptions: {
        headers?: HttpHeaders | { [header: string]: string | string[] };
        params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
        responseType: 'arraybuffer';
        observe?: 'body' | 'events' | 'response';
      } = {
        responseType: 'arraybuffer',
      };
      if (arrayBufferRequestOptions.headers !== undefined) {
        httpOptions.headers = arrayBufferRequestOptions.headers;
      }
      if (arrayBufferRequestOptions.params !== undefined) {
        httpOptions.params = arrayBufferRequestOptions.params;
      }
      if (arrayBufferRequestOptions.observe !== undefined) {
        httpOptions.observe = arrayBufferRequestOptions.observe;
      }
      const arrayBufferOptions: {
        headers?: HttpHeaders | { [header: string]: string | string[] };
        params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
        responseType: 'arraybuffer';
        observe?: 'body';
      } = {
        responseType: 'arraybuffer',
        observe: 'body',
      };
      if (httpOptions.headers !== undefined) {
        arrayBufferOptions.headers = httpOptions.headers;
      }
      if (httpOptions.params !== undefined) {
        arrayBufferOptions.params = httpOptions.params;
      }
      return (this.http.put(url, body, arrayBufferOptions) as Observable<ArrayBuffer>).pipe(
        catchError(this.handleError.bind(this)),
        map((value: ArrayBuffer) => value as T)
      ) as Observable<T>;
    }

    // Build request options for non-arraybuffer responses
    // Use explicit type to help TypeScript match the correct HttpClient overload
    const requestOptions: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
      responseType?: 'json' | 'text' | 'blob';
      observe?: 'body';
    } = {
      headers,
      observe: observe as 'body',
    };
    if (params !== undefined) {
      requestOptions.params = params;
    }
    if (responseType !== 'json') {
      requestOptions.responseType = responseType as 'text' | 'blob';
    }

    // TypeScript needs explicit typing for HttpClient overloads
    // Use type assertion to help TypeScript understand the return type
    return this.http.put(url, body, requestOptions as any).pipe(catchError(this.handleError.bind(this))) as Observable<T>;
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: RequestBody, options?: ApiRequestOptions): Observable<T> {
    const url = this.getApiUrl(endpoint);
    const headers = this.getDefaultHeaders(options?.headers);
    const params =
      options?.params instanceof HttpParams
        ? options.params
        : options?.params
        ? new HttpParams({ fromObject: options.params })
        : undefined;

    const responseType = options?.responseType || 'json';
    const observe = options?.observe || 'body';

    if (responseType === 'arraybuffer') {
      const arrayBufferRequestOptions: {
        headers?: HttpHeaders | { [header: string]: string | string[] };
        params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
        responseType: 'arraybuffer';
        observe?: 'body' | 'events' | 'response';
      } = {
        headers,
        responseType: 'arraybuffer',
        observe,
      };
      if (params !== undefined) {
        arrayBufferRequestOptions.params = params;
      }
      const httpOptions: {
        headers?: HttpHeaders | { [header: string]: string | string[] };
        params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
        responseType: 'arraybuffer';
        observe?: 'body' | 'events' | 'response';
      } = {
        responseType: 'arraybuffer',
      };
      if (arrayBufferRequestOptions.headers !== undefined) {
        httpOptions.headers = arrayBufferRequestOptions.headers;
      }
      if (arrayBufferRequestOptions.params !== undefined) {
        httpOptions.params = arrayBufferRequestOptions.params;
      }
      if (arrayBufferRequestOptions.observe !== undefined) {
        httpOptions.observe = arrayBufferRequestOptions.observe;
      }
      const arrayBufferOptions: {
        headers?: HttpHeaders | { [header: string]: string | string[] };
        params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
        responseType: 'arraybuffer';
        observe?: 'body';
      } = {
        responseType: 'arraybuffer',
        observe: 'body',
      };
      if (httpOptions.headers !== undefined) {
        arrayBufferOptions.headers = httpOptions.headers;
      }
      if (httpOptions.params !== undefined) {
        arrayBufferOptions.params = httpOptions.params;
      }
      return (this.http.patch(url, body, arrayBufferOptions) as Observable<ArrayBuffer>).pipe(
        catchError(this.handleError.bind(this)),
        map((value: ArrayBuffer) => value as T)
      ) as Observable<T>;
    }

    // Build request options for non-arraybuffer responses
    // Use explicit type to help TypeScript match the correct HttpClient overload
    const requestOptions: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
      responseType?: 'json' | 'text' | 'blob';
      observe?: 'body';
    } = {
      headers,
      observe: observe as 'body',
    };
    if (params !== undefined) {
      requestOptions.params = params;
    }
    if (responseType !== 'json') {
      requestOptions.responseType = responseType as 'text' | 'blob';
    }

    // TypeScript needs explicit typing for HttpClient overloads
    // Use type assertion to help TypeScript understand the return type
    return this.http.patch(url, body, requestOptions as any).pipe(catchError(this.handleError.bind(this))) as Observable<T>;
  }

  /**
   * DELETE request
   */
  // Overload for arraybuffer response type
  delete<T = ArrayBuffer>(endpoint: string, options?: ApiRequestOptions & { responseType: 'arraybuffer' }): Observable<T>;
  // Overload for other response types
  delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<T>;
  // Implementation
  delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    const url = this.getApiUrl(endpoint);
    const headers = this.getDefaultHeaders(options?.headers);
    const params =
      options?.params instanceof HttpParams
        ? options.params
        : options?.params
        ? new HttpParams({ fromObject: options.params })
        : undefined;

    const responseType = options?.responseType || 'json';
    const observe = options?.observe || 'body';

    if (responseType === 'arraybuffer') {
      const arrayBufferRequestOptions: {
        headers?: HttpHeaders | { [header: string]: string | string[] };
        params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
        responseType: 'arraybuffer';
        observe?: 'body' | 'events' | 'response';
      } = {
        headers,
        responseType: 'arraybuffer',
        observe,
      };
      if (params !== undefined) {
        arrayBufferRequestOptions.params = params;
      }
      const httpOptions: {
        headers?: HttpHeaders | { [header: string]: string | string[] };
        params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
        responseType: 'arraybuffer';
        observe?: 'body' | 'events' | 'response';
      } = {
        responseType: 'arraybuffer',
      };
      if (arrayBufferRequestOptions.headers !== undefined) {
        httpOptions.headers = arrayBufferRequestOptions.headers;
      }
      if (arrayBufferRequestOptions.params !== undefined) {
        httpOptions.params = arrayBufferRequestOptions.params;
      }
      if (arrayBufferRequestOptions.observe !== undefined) {
        httpOptions.observe = arrayBufferRequestOptions.observe;
      }
      const arrayBufferOptions: {
        headers?: HttpHeaders | { [header: string]: string | string[] };
        params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
        responseType: 'arraybuffer';
        observe?: 'body';
      } = {
        responseType: 'arraybuffer',
        observe: 'body',
      };
      if (httpOptions.headers !== undefined) {
        arrayBufferOptions.headers = httpOptions.headers;
      }
      if (httpOptions.params !== undefined) {
        arrayBufferOptions.params = httpOptions.params;
      }
      return (this.http.delete(url, arrayBufferOptions) as Observable<ArrayBuffer>).pipe(
        catchError(this.handleError.bind(this)),
        map((value: ArrayBuffer) => value as T)
      ) as Observable<T>;
    }

    // Build request options for non-arraybuffer responses
    // Use explicit type to help TypeScript match the correct HttpClient overload
    const requestOptions: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
      responseType?: 'json' | 'text' | 'blob';
      observe?: 'body';
    } = {
      headers,
      observe: observe as 'body',
    };
    if (params !== undefined) {
      requestOptions.params = params;
    }
    if (responseType !== 'json') {
      requestOptions.responseType = responseType as 'text' | 'blob';
    }

    // TypeScript needs explicit typing for HttpClient overloads
    // Use type assertion to help TypeScript understand the return type
    return this.http.delete(url, requestOptions as any).pipe(catchError(this.handleError.bind(this))) as Observable<T>;
  }

  /**
   * Get base URL (for reference)
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get API version (for reference)
   */
  getApiVersion(): string {
    return this.apiVersion;
  }

  /**
   * Get application ID (for reference)
   */
  getApplicationId(): string {
    return this.applicationId;
  }
}

/**
 * Provider function for API Client configuration
 */
export function provideApiClientConfig(config: ApiClientConfig) {
  return {
    provide: 'API_CONFIG',
    useValue: config,
  };
}
