import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface VirtualWorker {
  id: string;
  name: string;
  type: 'MARKETER' | 'DESIGNER' | 'COPYWRITER' | 'ANALYST' | 'CUSTOM';
  description?: string;
  status: 'IDLE' | 'ACTIVE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ERROR';
  config: Record<string, any>;
  metrics?: {
    tasksCompleted: number;
    tasksFailed: number;
    avgExecutionTime: number;
    successRate: number;
    totalCost: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateVirtualWorkerDto {
  name: string;
  type: 'MARKETER' | 'DESIGNER' | 'COPYWRITER' | 'ANALYST' | 'CUSTOM';
  description?: string;
  config: Record<string, any>;
}

export interface TaskAssignment {
  workerId: string;
  taskType: string;
  taskData: Record<string, any>;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface VirtualWorkerTask {
  id: string;
  workerId: string;
  taskType: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class VirtualWorkerService {
  private http = inject(HttpClient);
  private apiUrl = '/api/virtual-workers';

  list(): Observable<VirtualWorker[]> {
    return this.http.get<VirtualWorker[]>(`${this.apiUrl}`);
  }

  get(id: string): Observable<VirtualWorker> {
    return this.http.get<VirtualWorker>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateVirtualWorkerDto): Observable<VirtualWorker> {
    return this.http.post<VirtualWorker>(`${this.apiUrl}`, dto);
  }

  update(id: string, dto: Partial<CreateVirtualWorkerDto>): Observable<VirtualWorker> {
    return this.http.put<VirtualWorker>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignTask(assignment: TaskAssignment): Observable<any> {
    return this.http.post(`${this.apiUrl}/${assignment.workerId}/tasks`, {
      taskType: assignment.taskType,
      taskData: assignment.taskData,
      priority: assignment.priority || 'MEDIUM',
    });
  }

  pause(id: string): Observable<VirtualWorker> {
    return this.http.post<VirtualWorker>(`${this.apiUrl}/${id}/pause`, {});
  }

  resume(id: string): Observable<VirtualWorker> {
    return this.http.post<VirtualWorker>(`${this.apiUrl}/${id}/resume`, {});
  }

  getStatus(id: string): Observable<VirtualWorker> {
    return this.http.get<VirtualWorker>(`${this.apiUrl}/${id}/status`);
  }

  getMetrics(id: string, period?: '1h' | '24h' | '7d' | '30d'): Observable<any> {
    let httpParams = new HttpParams();
    if (period) {
      httpParams = httpParams.set('period', period);
    }
    return this.http.get(`${this.apiUrl}/${id}/metrics`, {
      params: httpParams,
      responseType: 'json',
    });
  }

  getTasks(id: string, status?: string): Observable<VirtualWorkerTask[]> {
    let httpParams = new HttpParams();
    if (status) {
      httpParams = httpParams.set('status', status);
    }
    return this.http.get<VirtualWorkerTask[]>(`${this.apiUrl}/${id}/tasks`, {
      params: httpParams,
      responseType: 'json',
    });
  }
}
