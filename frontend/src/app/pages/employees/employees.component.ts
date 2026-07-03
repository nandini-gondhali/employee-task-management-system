import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css'
})
export class EmployeesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private cdr = inject(ChangeDetectorRef);

  employees: Employee[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  showForm = false;
  editingId: number | null = null;

  page = 1;
  limit = 10;
  totalPages = 1;
  search = '';
  sortBy = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  employeeForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    department: ['', Validators.required],
    designation: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadEmployees();
  }

loadEmployees(): void {
  this.loading = true;
  this.errorMessage = '';

  this.employeeService.getEmployees({
    page: this.page,
    limit: this.limit,
    search: this.search,
    sortBy: this.sortBy,
    sortOrder: this.sortOrder
  }).subscribe({
    next: (res: any) => {
      console.log('Employees API response:', res);

      this.employees = [...(res?.data?.employees ?? [])];
      this.totalPages = res?.data?.pagination?.totalPages ?? 1;
      this.loading = false;

      this.cdr.detectChanges();
    },
    error: (err) => {
      this.errorMessage = err.error?.message || 'Failed to load employees.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  onSearch(): void {
    this.page = 1;
    this.loadEmployees();
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.loadEmployees();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadEmployees();
    }
  }

  openAddForm(): void {
    this.editingId = null;
    this.employeeForm.reset();
    this.showForm = true;
  }

openEditForm(employee: Employee): void {
  console.log('Edit clicked:', employee);

  this.errorMessage = '';
  this.successMessage = '';
  this.editingId = employee.id;

  this.employeeForm.patchValue({
    name: employee.name,
    email: employee.email,
    department: employee.department,
    designation: employee.designation
  });

  this.showForm = true;

  this.cdr.detectChanges();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.employeeForm.reset();
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const data = this.employeeForm.getRawValue() as Omit<Employee, 'id'>;
    this.errorMessage = '';
    this.successMessage = '';

    const request = this.editingId
      ? this.employeeService.updateEmployee(this.editingId, data)
      : this.employeeService.createEmployee(data);

    request.subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Saved successfully.';
        this.showForm = false;
        this.editingId = null;
        this.employeeForm.reset();
        this.loadEmployees();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Operation failed.';
      }
    });
  }

  deleteEmployee(id: number): void {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    this.employeeService.deleteEmployee(id).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Employee deleted.';
        this.loadEmployees();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Delete failed.';
      }
    });
  }
}
