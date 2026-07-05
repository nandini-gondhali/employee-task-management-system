import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { DashboardData } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  data: DashboardData | null = null;
  errorMessage = '';
  loading = true;
  isAdmin = this.auth.isAdmin();

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboard().subscribe({
      next: (res: any) => {
        console.log('Dashboard API response:', res);

        this.data = res?.data ?? null;
        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Dashboard load error:', err);

        this.errorMessage = err.error?.message || 'Failed to load dashboard.';
        this.data = null;
        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }
}