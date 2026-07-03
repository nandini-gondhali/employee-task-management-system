import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse, Notification } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = inject(ApiService);

  getNotifications() {
    return this.api.get<ApiResponse<Notification[]>>('/notifications');
  }

  markAsRead(id: number) {
    return this.api.put<ApiResponse>(`/notifications/${id}/read`, {});
  }

  markAllAsRead() {
    return this.api.put<ApiResponse>('/notifications/read-all', {});
  }
}
