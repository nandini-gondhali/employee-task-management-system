import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse, DashboardData } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = inject(ApiService);

  getDashboard() {
    return this.api.get<ApiResponse<DashboardData>>('/dashboard');
  }
}
