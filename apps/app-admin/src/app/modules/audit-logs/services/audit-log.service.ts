import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { AuditLog, AuditLogFilters, AuditLogListResponse } from '@workix/shared/frontend/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  private readonly apiUrl: string = '/api/audit-logs';

  constructor(private readonly http: HttpClient) {}

  getAuditLogs(skip = 0, take = 10, filters?: AuditLogFilters): Observable<AuditLogListResponse> {
    let params: HttpParams = new HttpParams()
      .set('skip', skip.toString())
      .set('take', take.toString());

    if (filters?.userId) {
      params = params.set('userId', filters.userId);
    }
    if (filters?.action) {
      params = params.set('action', filters.action);
    }
    if (filters?.entityType) {
      params = params.set('entityType', filters.entityType);
    }
    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<AuditLogListResponse>(this.apiUrl, { params });
  }

  getAuditLogById(id: string): Observable<AuditLog> {
    return this.http.get<AuditLog>(`${this.apiUrl}/${id}`);
  }

  getActions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/actions`);
  }

  getEntityTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/entity-types`);
  }

  exportAuditLogs(format: 'csv' | 'json' = 'csv', filters?: AuditLogFilters): Observable<Blob> {
    let params: HttpParams = new HttpParams().set('format', format);

    if (filters?.userId) {
      params = params.set('userId', filters.userId);
    }
    if (filters?.action) {
      params = params.set('action', filters.action);
    }
    if (filters?.entityType) {
      params = params.set('entityType', filters.entityType);
    }
    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<Blob>(this.apiUrl, {
      params,
      responseType: 'blob' as 'json',
    });
  }
}
