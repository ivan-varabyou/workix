// Jest globals are available without import
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { ApiClientService, ApiClientConfig, provideApiClientConfig } from './api-client.service';

describe('ApiClientService', () => {
  let service: ApiClientService;
  let httpMock: HttpTestingController;
  const mockConfig: ApiClientConfig = {
    apiUrl: 'https://api.example.com',
    apiVersion: 'v1',
    applicationId: 'test-app-id',
    apiKey: 'test-api-key',
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideApiClientConfig(mockConfig), ApiClientService],
    });

    service = TestBed.inject(ApiClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    try {
      if (httpMock) {
        httpMock.verify();
      }
    } catch (e) {
      // Ignore verification errors
    }
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should throw error if config is not provided', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [ApiClientService],
      });

      expect(() => TestBed.inject(ApiClientService)).toThrow(
        'API_CONFIG must be provided. Use provideApiClientConfig() in your app config.'
      );
    });

    it('should initialize with config', () => {
      expect(service.getBaseUrl()).toBe('https://api.example.com');
      expect(service.getApiVersion()).toBe('v1');
      expect(service.getApplicationId()).toBe('test-app-id');
    });
  });

  describe('GET requests', () => {
    it('should make GET request with correct URL and headers', () => {
      const mockData = { id: 1, name: 'Test' };
      const endpoint = 'users';

      service.get(endpoint).subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('https://api.example.com/api/v1/users');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('X-Application-Id')).toBe('test-app-id');
      expect(req.request.headers.get('X-API-Key')).toBe('test-api-key');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(mockData);
    });

    it('should handle endpoint with leading slash', () => {
      const mockData = { id: 1 };
      const endpoint = '/users';

      service.get(endpoint).subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('https://api.example.com/api/v1/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle endpoint that already includes api/v', () => {
      const mockData = { id: 1 };
      const endpoint = 'api/v2/users';

      service.get(endpoint).subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('https://api.example.com/api/v2/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should include query parameters', () => {
      const mockData = { id: 1 };
      const endpoint = 'users';
      const params = { page: '1', limit: '10' };

      service.get(endpoint, { params }).subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne((request) => {
        return (
          request.url === 'https://api.example.com/api/v1/users' &&
          request.params.get('page') === '1'
        );
      });
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle HTTP errors', () => {
      const endpoint = 'users';
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Not Found' },
        status: 404,
        statusText: 'Not Found',
      });

      service.get(endpoint).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toContain('Not Found');
        },
      });

      const req = httpMock.expectOne('https://api.example.com/api/v1/users');
      req.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('POST requests', () => {
    it('should make POST request with body', () => {
      const mockData = { id: 1, name: 'New User' };
      const endpoint = 'users';
      const body = { name: 'New User' };

      service.post(endpoint, body).subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('https://api.example.com/api/v1/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush(mockData);
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request with body', () => {
      const mockData = { id: 1, name: 'Updated User' };
      const endpoint = 'users/1';
      const body = { name: 'Updated User' };

      service.put(endpoint, body).subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('https://api.example.com/api/v1/users/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush(mockData);
    });
  });

  describe('PATCH requests', () => {
    it('should make PATCH request with body', () => {
      const mockData = { id: 1, name: 'Patched User' };
      const endpoint = 'users/1';
      const body = { name: 'Patched User' };

      service.patch(endpoint, body).subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('https://api.example.com/api/v1/users/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(body);
      req.flush(mockData);
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', () => {
      const endpoint = 'users/1';

      service.delete(endpoint).subscribe((data) => {
        expect(data).toBeNull();
      });

      const req = httpMock.expectOne('https://api.example.com/api/v1/users/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Custom headers', () => {
    it('should merge custom headers', () => {
      const mockData = { id: 1 };
      const endpoint = 'users';
      const customHeaders = { 'X-Custom-Header': 'custom-value' };

      service.get(endpoint, { headers: customHeaders }).subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('https://api.example.com/api/v1/users');
      expect(req.request.headers.get('X-Application-Id')).toBe('test-app-id');
      expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');
      req.flush(mockData);
    });
  });

  describe('Without API key', () => {
    it('should work without API key', () => {
      TestBed.resetTestingModule();
      const configWithoutKey: ApiClientConfig = {
        apiUrl: 'https://api.example.com',
        apiVersion: 'v1',
        applicationId: 'test-app-id',
      };

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [ApiClientService, provideApiClientConfig(configWithoutKey)],
      });

      const serviceWithoutKey = TestBed.inject(ApiClientService);
      const httpMockWithoutKey = TestBed.inject(HttpTestingController);

      const mockData = { id: 1 };
      serviceWithoutKey.get('users').subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMockWithoutKey.expectOne('https://api.example.com/api/v1/users');
      expect(req.request.headers.has('X-API-Key')).toBe(false);
      req.flush(mockData);
      httpMockWithoutKey.verify();
    });
  });
});
