import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Settings,
  TestEmailResult,
  UpdateEmailSettingsDto,
  UpdateGeneralSettingsDto,
  UpdateSecuritySettingsDto,
  UpdateSystemConfigDto,
} from '../interfaces/settings.interface';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly apiUrl: string = '/api/settings';

  constructor(private readonly http: HttpClient) {}

  getSettings(): Observable<Settings> {
    return this.http.get<Settings>(this.apiUrl);
  }

  updateGeneralSettings(settings: UpdateGeneralSettingsDto): Observable<Settings> {
    return this.http.put<Settings>(`${this.apiUrl}/general`, settings);
  }

  updateSecuritySettings(settings: UpdateSecuritySettingsDto): Observable<Settings> {
    return this.http.put<Settings>(`${this.apiUrl}/security`, settings);
  }

  updateEmailSettings(settings: UpdateEmailSettingsDto): Observable<Settings> {
    return this.http.put<Settings>(`${this.apiUrl}/email`, settings);
  }

  testEmailSettings(): Observable<TestEmailResult> {
    return this.http.post<TestEmailResult>(`${this.apiUrl}/email/test`, {});
  }

  getSystemConfig(): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.apiUrl}/system`);
  }

  updateSystemConfig(config: UpdateSystemConfigDto): Observable<Record<string, unknown>> {
    return this.http.put<Record<string, unknown>>(`${this.apiUrl}/system`, config);
  }
}
