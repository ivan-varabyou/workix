import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type {
  AssignPermissionsDto,
  CreateRoleDto,
  Permission,
  Role,
  UpdateRoleDto,
} from '@workix/shared/frontend/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly apiUrl: string = '/api/rbac/roles';
  private readonly permissionsUrl: string = '/api/rbac/permissions';

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  createRole(data: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, data);
  }

  updateRole(id: string, data: UpdateRoleDto): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, data);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.permissionsUrl);
  }

  assignPermissionsToRole(roleId: string, permissionIds: string[]): Observable<void> {
    const payload: AssignPermissionsDto = { permissionIds };
    return this.http.post<void>(`${this.apiUrl}/${roleId}/permissions`, payload);
  }

  getRolePermissions(roleId: string): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/${roleId}/permissions`);
  }
}
