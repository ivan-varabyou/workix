import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ApiUsageStats,
  AuthenticationStats,
  DashboardStats,
  ErrorRate,
  PipelineExecutionStats,
  SystemHealth,
  TopUser,
  UsersGrowth,
} from '../interfaces/analytics.interface';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly apiUrl: string = '/api/analytics';

  constructor(private readonly http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getUsersGrowth(period: string): Observable<UsersGrowth[]> {
    const params: HttpParams = new HttpParams().set('period', period);
    return this.http.get<UsersGrowth[]>(`${this.apiUrl}/users-growth`, { params });
  }

  getAuthenticationStats(period: string): Observable<AuthenticationStats> {
    const params: HttpParams = new HttpParams().set('period', period);
    return this.http.get<AuthenticationStats>(`${this.apiUrl}/auth-stats`, { params });
  }

  getPipelineExecutionStats(period: string): Observable<PipelineExecutionStats> {
    const params: HttpParams = new HttpParams().set('period', period);
    return this.http.get<PipelineExecutionStats>(`${this.apiUrl}/pipeline-stats`, { params });
  }

  getApiUsageStats(period: string): Observable<ApiUsageStats> {
    const params: HttpParams = new HttpParams().set('period', period);
    return this.http.get<ApiUsageStats>(`${this.apiUrl}/api-usage`, { params });
  }

  getSystemHealth(): Observable<SystemHealth> {
    return this.http.get<SystemHealth>(`${this.apiUrl}/system-health`);
  }

  getTopUsers(limit = 10): Observable<TopUser[]> {
    const params: HttpParams = new HttpParams().set('limit', limit.toString());
    return this.http.get<TopUser[]>(`${this.apiUrl}/top-users`, { params });
  }

  getErrorRates(period: string): Observable<ErrorRate> {
    const params: HttpParams = new HttpParams().set('period', period);
    return this.http.get<ErrorRate>(`${this.apiUrl}/error-rates`, { params });
  }
}
