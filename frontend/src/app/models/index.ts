export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'admin' | 'employee';
  employeeId?: number | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    rememberMe: boolean;
    user: User;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface Employee {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  created_at?: string;
}

export interface TaskAttachment {
  id: number;
  task_id: number;
  file_path: string;
  original_name: string;
  file_size: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  start_date: string;
  due_date: string;
  assigned_employee_id: number;
  assigned_employee_name?: string;
  assigned_employee_email?: string;
  created_by?: number;
  created_by_name?: string;
  completed_at?: string | null;
  attachments?: TaskAttachment[];
}

export interface Notification {
  id: number;
  user_id: number;
  task_id?: number;
  message: string;
  type: 'task_assigned' | 'task_due' | 'task_completed';
  is_read: number;
  created_at: string;
  task_title?: string;
}

export interface DashboardData {
  role: 'admin' | 'employee';
  totalEmployees?: number;
  totalTasks?: number;
  completedTasks?: number;
  pendingTasks?: number;
  myTasks?: number;
  overdueTasks?: number;
}

export interface PaginatedEmployees {
  employees: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
