import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private api = inject(ApiService);

  getCompletedReport() {
    return this.api.get<ApiResponse<Record<string, unknown>[]>>('/reports/completed');
  }

  getPendingReport() {
    return this.api.get<ApiResponse<Record<string, unknown>[]>>('/reports/pending');
  }

  getEmployeeWiseReport() {
    return this.api.get<ApiResponse<Record<string, unknown>[]>>('/reports/employee-wise');
  }

  exportCsv(type: string) {
    return this.api.downloadFile(`/reports/export/csv?type=${type}`);
  }

  exportExcel(type: string) {
    return this.api.downloadFile(`/reports/export/excel?type=${type}`);
  }
}
