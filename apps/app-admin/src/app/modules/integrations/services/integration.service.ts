import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type {
  CreateCredentialDto,
  IntegrationCredential,
  IntegrationProvider,
  UpdateCredentialDto,
} from '@workix/shared/frontend/core';
import { Observable } from 'rxjs';

import {
  CreateProviderDto,
  DashboardData,
  IntegrationAlert,
  IntegrationConfig,
  IntegrationError,
  IntegrationHealth,
  IntegrationMetrics,
  RotateCredentialsResponse,
  SetConfigDto,
  UpdateProviderDto,
} from '../interfaces/integration.interface';

@Injectable({
  providedIn: 'root',
})
export class IntegrationService {
  private readonly apiUrl: string = '/api/integrations';

  constructor(private http: HttpClient) {}

  // Providers
  listProviders(): Observable<IntegrationProvider[]> {
    return this.http.get<IntegrationProvider[]>(`${this.apiUrl}/providers`);
  }

  getProvider(id: string): Observable<IntegrationProvider> {
    return this.http.get<IntegrationProvider>(`${this.apiUrl}/providers/${id}`);
  }

  createProvider(data: CreateProviderDto): Observable<IntegrationProvider> {
    return this.http.post<IntegrationProvider>(`${this.apiUrl}/providers`, data);
  }

  updateProvider(id: string, data: UpdateProviderDto): Observable<IntegrationProvider> {
    return this.http.put<IntegrationProvider>(`${this.apiUrl}/providers/${id}`, data);
  }

  deleteProvider(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/providers/${id}`);
  }

  // Credentials
  listCredentials(providerId: string, userId?: string): Observable<IntegrationCredential[]> {
    let params: HttpParams = new HttpParams();
    if (userId) {
      params = params.set('userId', userId);
    }
    return this.http.get<IntegrationCredential[]>(
      `${this.apiUrl}/providers/${providerId}/credentials`,
      { params }
    );
  }

  getCredential(credentialId: string): Observable<IntegrationCredential> {
    return this.http.get<IntegrationCredential>(
      `${this.apiUrl}/providers/credentials/${credentialId}`
    );
  }

  addCredential(providerId: string, data: CreateCredentialDto): Observable<IntegrationCredential> {
    return this.http.post<IntegrationCredential>(
      `${this.apiUrl}/providers/${providerId}/credentials`,
      data
    );
  }

  updateCredential(
    credentialId: string,
    data: UpdateCredentialDto,
    expiresAt?: Date
  ): Observable<IntegrationCredential> {
    const payload: UpdateCredentialDto = { ...data };
    if (expiresAt !== undefined) {
      payload.expiresAt = expiresAt.toISOString();
    } else if (data.expiresAt !== undefined) {
      payload.expiresAt = data.expiresAt;
    }
    return this.http.put<IntegrationCredential>(
      `${this.apiUrl}/providers/credentials/${credentialId}`,
      payload
    );
  }

  deleteCredential(credentialId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/providers/credentials/${credentialId}`);
  }

  rotateCredentials(providerId: string): Observable<RotateCredentialsResponse> {
    return this.http.post<RotateCredentialsResponse>(
      `${this.apiUrl}/providers/${providerId}/credentials/rotate`,
      {}
    );
  }

  // Configs
  listConfigs(providerId: string): Observable<IntegrationConfig[]> {
    return this.http.get<IntegrationConfig[]>(`${this.apiUrl}/providers/${providerId}/config`);
  }

  setConfig(
    providerId: string,
    key: string,
    value: string | number | boolean | Record<string, unknown> | null | undefined
  ): Observable<IntegrationConfig> {
    const payload: SetConfigDto = { key, value };
    return this.http.post<IntegrationConfig>(
      `${this.apiUrl}/providers/${providerId}/config`,
      payload
    );
  }

  // Health
  getHealth(providerId?: string): Observable<IntegrationHealth> {
    const url: string = providerId
      ? `${this.apiUrl}/health/${providerId}`
      : `${this.apiUrl}/health`;
    return this.http.get<IntegrationHealth>(url);
  }

  // Metrics
  getMetrics(
    providerId?: string,
    startDate?: string,
    endDate?: string
  ): Observable<IntegrationMetrics> {
    let params: HttpParams = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    const url: string = providerId
      ? `${this.apiUrl}/metrics/provider/${providerId}`
      : `${this.apiUrl}/metrics`;
    return this.http.get<IntegrationMetrics>(url, { params });
  }

  getRecentErrors(limit = 50): Observable<IntegrationError[]> {
    return this.http.get<IntegrationError[]>(`${this.apiUrl}/metrics/errors`, {
      params: { limit: limit.toString() },
    });
  }

  // Monitoring
  getOverallHealth(): Observable<IntegrationHealth> {
    return this.http.get<IntegrationHealth>(`${this.apiUrl}/monitoring/health`);
  }

  getAlerts(
    errorRate?: number,
    latencyMs?: number,
    consecutiveFailures?: number
  ): Observable<IntegrationAlert[]> {
    let params: HttpParams = new HttpParams();
    if (errorRate !== undefined) params = params.set('errorRate', errorRate.toString());
    if (latencyMs !== undefined) params = params.set('latencyMs', latencyMs.toString());
    if (consecutiveFailures !== undefined)
      params = params.set('consecutiveFailures', consecutiveFailures.toString());
    return this.http.get<IntegrationAlert[]>(`${this.apiUrl}/monitoring/alerts`, { params });
  }

  getDashboardData(period: '1h' | '24h' | '7d' | '30d' = '24h'): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/monitoring/dashboard`, {
      params: { period },
    });
  }

  // Credential Rotation
  rotateAllCredentials(): Observable<RotateCredentialsResponse> {
    return this.http.post<RotateCredentialsResponse>(`${this.apiUrl}/credentials/rotate/all`, {});
  }

  rotateExpiredCredentials(): Observable<RotateCredentialsResponse> {
    return this.http.post<RotateCredentialsResponse>(
      `${this.apiUrl}/credentials/rotate/expired`,
      {}
    );
  }

  rotateExpiringCredentials(days = 7): Observable<RotateCredentialsResponse> {
    return this.http.post<RotateCredentialsResponse>(
      `${this.apiUrl}/credentials/rotate/expiring`,
      {},
      { params: { days: days.toString() } }
    );
  }
}
