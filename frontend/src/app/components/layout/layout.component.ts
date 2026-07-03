import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  private auth = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  user = this.auth.getUser();
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        this.notifications = res.data || [];
        this.unreadCount = this.notifications.filter((n) => !n.is_read).length;
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  markAsRead(notification: Notification): void {
    if (notification.is_read) return;
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.is_read = 1;
        this.unreadCount = this.notifications.filter((n) => !n.is_read).length;
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach((n) => (n.is_read = 1));
        this.unreadCount = 0;
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }
}
