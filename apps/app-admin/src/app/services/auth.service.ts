import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import {
  AuthResponse,
  CurrentUser,
  LoginRequest,
  RefreshTokenRequest,
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl: string = '/api/auth';
  private readonly currentUserSubject: BehaviorSubject<CurrentUser | null>;
  public readonly currentUser: Observable<CurrentUser | null>;

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    const storedUser: string | null = localStorage.getItem('currentUser');
    const parsedUser: CurrentUser | null = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<CurrentUser | null>(parsedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const payload: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      map((response: AuthResponse) => {
        if (response && response.access_token) {
          const userData: CurrentUser = response as CurrentUser;
          localStorage.setItem('currentUser', JSON.stringify(userData));
          this.currentUserSubject.next(userData);
        }
        return response;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  getToken(): string | null {
    return this.currentUserValue?.access_token || null;
  }

  refreshToken(): Observable<AuthResponse> {
    const currentUser: CurrentUser | null = this.currentUserValue;
    if (!currentUser?.refresh_token) {
      throw new Error('No refresh token available');
    }
    const payload: RefreshTokenRequest = {
      refresh_token: currentUser.refresh_token,
    };
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, payload).pipe(
      tap((response) => {
        if (response && response.access_token) {
          const userData: CurrentUser = response as CurrentUser;
          localStorage.setItem('currentUser', JSON.stringify(userData));
          this.currentUserSubject.next(userData);
        }
      })
    );
  }
}
