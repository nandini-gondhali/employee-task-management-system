import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private cdr = inject(ChangeDetectorRef);

  activeTab: 'completed' | 'pending' | 'employee-wise' = 'completed';
  completedData: Record<string, unknown>[] = [];
  pendingData: Record<string, unknown>[] = [];
  employeeWiseData: Record<string, unknown>[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadReport('completed');
  }

  setTab(tab: 'completed' | 'pending' | 'employee-wise'): void {
    this.activeTab = tab;
    this.loadReport(tab);
  }

loadReport(tab: 'completed' | 'pending' | 'employee-wise'): void {
  this.loading = true;
  this.errorMessage = '';

  const handlers = {
    completed: () => this.reportService.getCompletedReport(),
    pending: () => this.reportService.getPendingReport(),
    'employee-wise': () => this.reportService.getEmployeeWiseReport()
  };

  handlers[tab]().subscribe({
    next: (res: any) => {

      console.log('Report Response', res);

      switch (tab) {
        case 'completed':
          this.completedData = [...(res.data ?? [])];
          break;

        case 'pending':
          this.pendingData = [...(res.data ?? [])];
          break;

        case 'employee-wise':
          this.employeeWiseData = [...(res.data ?? [])];
          break;
      }

      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.errorMessage =
        err.error?.message || 'Failed to load report.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  exportCsv(): void {
    const type = this.activeTab === 'employee-wise' ? 'completed' : this.activeTab;
    this.reportService.exportCsv(type).subscribe({
      next: (blob) => this.downloadFile(blob, `${type}-report.csv`),
      error: () => {
        this.errorMessage = 'CSV export failed.';
      }
    });
  }

  exportExcel(): void {
    const type = this.activeTab === 'employee-wise' ? 'completed' : this.activeTab;
    this.reportService.exportExcel(type).subscribe({
      next: (blob) => this.downloadFile(blob, `${type}-report.xlsx`),
      error: () => {
        this.errorMessage = 'Excel export failed.';
      }
    });
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  get activeData(): Record<string, unknown>[] {
    if (this.activeTab === 'completed') return this.completedData;
    if (this.activeTab === 'pending') return this.pendingData;
    return this.employeeWiseData;
  }

  get columns(): string[] {
    if (this.activeData.length === 0) return [];
    return Object.keys(this.activeData[0]);
  }
}
