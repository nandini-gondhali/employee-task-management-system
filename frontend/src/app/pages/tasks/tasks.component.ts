import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Employee, Task } from '../../models';
import { environment } from '../../../environments/environment';

function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const startDate = control.get('startDate')?.value;
  const dueDate = control.get('dueDate')?.value;
  if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
    return { dateRange: true };
  }
  return null;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private employeeService = inject(EmployeeService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  tasks: Task[] = [];
  employees: Employee[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  showForm = false;
  editingTask: Task | null = null;
  selectedFile: File | null = null;
  isAdmin = this.auth.isAdmin();
  apiBase = environment.apiUrl.replace('/api', '');

  taskForm = this.fb.group(
    {
      title: ['', Validators.required],
      description: [''],
      priority: ['medium', Validators.required],
      status: ['pending', Validators.required],
      startDate: ['', Validators.required],
      dueDate: ['', Validators.required],
      assignedEmployeeId: ['', Validators.required]
    },
    { validators: dateRangeValidator }
  );

  ngOnInit(): void {
    this.loadTasks();
    if (this.isAdmin) {
      this.loadEmployees();
    } else {
      const user = this.auth.getUser();
      if (user?.employeeId) {
        this.taskForm.patchValue({ assignedEmployeeId: String(user.employeeId) });
      }
    }
  }

loadTasks(): void {
  this.loading = true;
  this.errorMessage = '';

  this.taskService.getTasks().subscribe({
    next: (res: any) => {
      console.log('Tasks API response:', res);

      this.tasks = Array.isArray(res?.data) ? [...res.data] : [];

      console.log('Assigned tasks:', this.tasks);

      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Tasks load error:', err);

      this.errorMessage = err.error?.message || 'Failed to load tasks.';
      this.tasks = [];
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  loadEmployees(): void {
    this.employeeService.getEmployees({ page: 1, limit: 100 }).subscribe({
      next: (res) => {
        this.employees = res.data?.employees || [];
      }
    });
  }

  openAddForm(): void {
    this.editingTask = null;
    this.taskForm.reset({
      priority: 'medium',
      status: 'pending',
      assignedEmployeeId: this.isAdmin ? '' : String(this.auth.getUser()?.employeeId || '')
    });
    this.selectedFile = null;
    this.showForm = true;
  }

  openEditForm(task: Task): void {
    if (task.status === 'completed') {
      this.errorMessage = 'Completed tasks cannot be edited.';
      return;
    }

    this.editingTask = task;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      startDate: task.start_date,
      dueDate: task.due_date,
      assignedEmployeeId: String(task.assigned_employee_id)
    });
    this.selectedFile = null;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingTask = null;
    this.selectedFile = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.getRawValue();
    const formData = new FormData();
    formData.append('title', formValue.title!);
    formData.append('description', formValue.description || '');
    formData.append('priority', formValue.priority!);
    formData.append('status', formValue.status!);
    formData.append('startDate', formValue.startDate!);
    formData.append('dueDate', formValue.dueDate!);
    formData.append('assignedEmployeeId', formValue.assignedEmployeeId!);

    if (this.selectedFile) {
      formData.append('attachment', this.selectedFile);
    }

    this.errorMessage = '';
    this.successMessage = '';

    const request = this.editingTask
      ? this.taskService.updateTask(this.editingTask.id, formData)
      : this.taskService.createTask(formData);

    request.subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Task saved successfully.';
        this.showForm = false;
        this.editingTask = null;
        this.loadTasks();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to save task.';
      }
    });
  }

  deleteTask(id: number): void {
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.taskService.deleteTask(id).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Task deleted.';
        this.loadTasks();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Delete failed.';
      }
    });
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      low: 'bg-secondary',
      medium: 'bg-info',
      high: 'bg-danger'
    };
    return map[priority] || 'bg-secondary';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-warning text-dark',
      in_progress: 'bg-primary',
      completed: 'bg-success'
    };
    return map[status] || 'bg-secondary';
  }
}
