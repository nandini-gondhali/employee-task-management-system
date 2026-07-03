import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse, Task } from '../models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private api = inject(ApiService);

  getTasks() {
    return this.api.get<ApiResponse<Task[]>>('/tasks');
  }

  createTask(formData: FormData) {
    return this.api.postFormData<ApiResponse>('/tasks', formData);
  }

  updateTask(id: number, formData: FormData) {
    return this.api.postFormData<ApiResponse>(`/tasks/${id}`, formData, 'PUT');
  }

  deleteTask(id: number) {
    return this.api.delete<ApiResponse>(`/tasks/${id}`);
  }
}
