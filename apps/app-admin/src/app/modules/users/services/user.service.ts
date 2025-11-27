import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type {
  CreateUserDto,
  UpdateUserDto,
  User,
  UserListResponse,
} from '@workix/shared/frontend/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl: string = '/api/users';

  constructor(private readonly http: HttpClient) {}

  getUsers(skip = 0, take = 10, search?: string): Observable<UserListResponse> {
    let params: HttpParams = new HttpParams()
      .set('skip', skip.toString())
      .set('take', take.toString());
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<UserListResponse>(this.apiUrl, { params });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(data: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, data);
  }

  updateUser(id: string, data: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deactivateUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  activateUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/activate`, {});
  }

  exportUsers(format: 'csv' | 'json' = 'csv'): Observable<Blob> {
    const params: HttpParams = new HttpParams().set('format', format);
    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob',
    });
  }
}
