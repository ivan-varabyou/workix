import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  CreatePipelineDto,
  Execution,
  ExecutionDetails,
  Pipeline,
  UpdatePipelineDto,
} from '@workix/shared/frontend/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PipelineService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiUrl: string = 'http://localhost:7000/api';

  getPipelines(): Observable<Pipeline[]> {
    return this.http.get<Pipeline[]>(`${this.apiUrl}/pipelines`);
  }

  getPipeline(id: string): Observable<Pipeline> {
    return this.http.get<Pipeline>(`${this.apiUrl}/pipelines/${id}`);
  }

  createPipeline(pipeline: CreatePipelineDto): Observable<Pipeline> {
    return this.http.post<Pipeline>(`${this.apiUrl}/pipelines`, pipeline);
  }

  updatePipeline(pipeline: UpdatePipelineDto & { id: string }): Observable<Pipeline> {
    return this.http.put<Pipeline>(`${this.apiUrl}/pipelines/${pipeline.id}`, pipeline);
  }

  deletePipeline(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pipelines/${id}`);
  }

  executePipeline(
    id: string,
    input?: Record<string, unknown>
  ): Observable<{ executionId: string; output: Record<string, unknown>; duration: number }> {
    return this.http.post<{
      executionId: string;
      output: Record<string, unknown>;
      duration: number;
    }>(`${this.apiUrl}/pipelines/${id}/execute`, input || {});
  }

  getPipelineExecutions(id: string): Observable<Execution[]> {
    return this.http.get<Execution[]>(`${this.apiUrl}/pipelines/${id}/executions`);
  }

  getExecutionDetails(pipelineId: string, executionId: string): Observable<ExecutionDetails> {
    return this.http.get<ExecutionDetails>(
      `${this.apiUrl}/pipelines/${pipelineId}/executions/${executionId}`
    );
  }
}
