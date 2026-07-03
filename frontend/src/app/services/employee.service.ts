import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse, Employee, PaginatedEmployees } from '../models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private api = inject(ApiService);

  getEmployees(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    const qs = query.toString();
    return this.api.get<ApiResponse<PaginatedEmployees>>(`/employees${qs ? `?${qs}` : ''}`);
  }

  createEmployee(data: Omit<Employee, 'id'>) {
    return this.api.post<ApiResponse<Employee>>('/employees', data);
  }

  updateEmployee(id: number, data: Omit<Employee, 'id'>) {
    return this.api.put<ApiResponse<Employee>>(`/employees/${id}`, data);
  }

  deleteEmployee(id: number) {
    return this.api.delete<ApiResponse>(`/employees/${id}`);
  }
}
