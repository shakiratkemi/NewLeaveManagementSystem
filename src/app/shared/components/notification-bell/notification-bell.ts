import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  signal,
  computed,
  ChangeDetectorRef,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HrService } from '../../../core/services/data/hr/hr-service';
import { Employee } from '../../../core/services/data/employee/employee';
import { Subscription } from 'rxjs';

export interface ApprovedLeaveNotification {
  id: string;
  employeeName: string;
  department: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  days: number;
  timestamp: string;
  isRead: boolean;
  avatarLetter: string;
}

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, MatIconModule, DatePipe],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.css',
})
export class NotificationBell implements OnInit, OnDestroy {
  @Input() role: 'HR' | 'Employee' = 'Employee';

  notifications = signal<ApprovedLeaveNotification[]>([]);
  isOpen = signal<boolean>(false);

  unreadCount = computed(() => {
    return this.notifications().filter((n) => !n.isRead).length;
  });

  private updateSub?: Subscription;

  constructor(
    private hrService: HrService,
    private employeeService: Employee,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef,
  ) {}

  ngOnInit(): void {
    this.fetchNotificationsFromApi();

    // Subscribe to live leave updates (e.g. when HR approves a request)
    this.updateSub = this.hrService.leaveRequestUpdated.subscribe(() => {
      this.fetchNotificationsFromApi();
    });
  }

  ngOnDestroy(): void {
    if (this.updateSub) {
      this.updateSub.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleDropdown(): void {
    this.isOpen.update((v) => !v);
  }

  fetchNotificationsFromApi(): void {
    if (this.role === 'HR') {
      this.hrService.getApprovedLeaveRequests().subscribe({
        next: (res: any) => this.processApiResponse(res),
        error: (err: any) => {
          console.error('Failed to load HR approved leaves from API:', err);
          this.processApiResponse(null);
        },
      });
    } else {
      this.employeeService.getApprovedLeaveRequests().subscribe({
        next: (res: any) => this.processApiResponse(res),
        error: (err: any) => {
          console.error('Failed to load Employee approved leaves from API:', err);
          this.processApiResponse(null);
        },
      });
    }
  }

  private processApiResponse(response: any): void {
    const readIdsStr = localStorage.getItem('read_approved_notification_ids');
    const readIds: string[] = readIdsStr ? JSON.parse(readIdsStr) : [];

    // Confirmed real response shape: { success, message, data: [...] }
    const list: any[] = Array.isArray(response?.data) ? response.data : [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Only show leaves that are currently active or still upcoming —
    // the endpoint itself returns ALL approved leaves regardless of date.
    const approvedList: ApprovedLeaveNotification[] = list
      .filter((item: any) => {
        if (!item.endDate) return true;
        const endDateStr = new Date(item.endDate).toISOString().split('T')[0];
        return endDateStr >= todayStr;
      })
      .map((item: any) => {
        const empName = item.employeeName || 'Employee';
        const isRead = readIds.includes(item.id);

        return {
          id: item.id,
          employeeName: empName,
          department: item.department || 'General',
          leaveTypeName: item.leaveTypeName || item.leaveType?.name || 'Leave',
          startDate: item.startDate,
          endDate: item.endDate,
          days: Number(item.numberOfDays ?? 1),
          timestamp: item.createdAt || item.startDate,
          isRead,
          avatarLetter: empName.trim().charAt(0).toUpperCase() || 'E',
        };
      });

    // Sort newest first
    approvedList.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    this.notifications.set(approvedList);
    this.cdr.detectChanges();
  }

  markAsRead(item: ApprovedLeaveNotification, event: Event): void {
    event.stopPropagation();
    if (item.isRead) return;

    const readIdsStr = localStorage.getItem('read_approved_notification_ids');
    const readIds: string[] = readIdsStr ? JSON.parse(readIdsStr) : [];
    if (!readIds.includes(item.id)) {
      readIds.push(item.id);
      localStorage.setItem('read_approved_notification_ids', JSON.stringify(readIds));
    }

    const updated = this.notifications().map((n) =>
      n.id === item.id ? { ...n, isRead: true } : n,
    );
    this.notifications.set(updated);
    this.cdr.detectChanges();
  }

  markAllAsRead(): void {
    const allIds = this.notifications().map((n) => n.id);
    localStorage.setItem('read_approved_notification_ids', JSON.stringify(allIds));

    const updated = this.notifications().map((n) => ({ ...n, isRead: true }));
    this.notifications.set(updated);
    this.cdr.detectChanges();
  }
}