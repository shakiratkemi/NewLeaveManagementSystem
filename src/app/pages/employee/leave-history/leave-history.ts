import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { LeaveHistoryDetails } from './leave-history-details/leave-history-details';
import { PageEvent, MatPaginatorModule, MatPaginator } from '@angular/material/paginator';

import { Employee } from '../../../core/services/data/employee/employee';
import { LeaveHistoryRow, LeaveRequestHistory } from '../../../core/interface/employee';

@Component({
  selector: 'app-leave-history',
  imports: [CommonModule, LeaveHistoryDetails, MatPaginatorModule],
  templateUrl: './leave-history.html',
  styles: ``,
})
export class LeaveHistory implements OnChanges, AfterViewInit {
  @Input() data: LeaveHistoryRow[] = [];

  @Output() viewDetails = new EventEmitter<LeaveHistoryRow>();
  @Output() cancelRequest = new EventEmitter<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  leaveRequests: LeaveHistoryRow[] = [];

  selectedRequest: LeaveHistoryRow | null = null;
  isModalOpen = false;

  pageSize = 5;
  pageIndex = 0;
  pagedData: LeaveHistoryRow[] = [];

  isLoading = false;
  usingFallbackData = false;

  constructor(
    private employeeService: Employee,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.updatePagedData();
    }
  }

  ngAfterViewInit(): void {
    this.loadLeaveRequests();
  }

  loadLeaveRequestById(id: string): void {
    this.employeeService.getLeaveRequestById(id).subscribe({
      next: (response) => {
        console.log(response);
        const payload = response?.data ?? response;
        const single = Array.isArray(payload) ? payload[0] : payload;
        if (!single) {
          return;
        }
        const mapped = this.mapSingleRecord(single);
        this.selectedRequest = mapped;
      },
      error: (err: any) => {
        console.error('Error fetching leave request by id:', err);
        this.selectedRequest = null;
      },
    });
  }

  private mapSingleRecord(record: any): LeaveHistoryRow {
    return {
      id: record.id || record.id || '',
      leaveType: this.formatLeaveType(record.leaveType),
      startDate: record.startDate || record.createdAt || '',
      endDate: record.endDate || '',
      duration: record.numberOfDays ?? record.days ?? 0,
      reason: record.reason || '',
      status: record.status || 'Pending',
    } as LeaveHistoryRow;
  }

  private formatLeaveType(leaveType: any): string {
    if (!leaveType) {
      return 'Unknown';
    }

    if (typeof leaveType === 'string') {
      return leaveType;
    }

    if (typeof leaveType === 'object') {
      return leaveType.name || leaveType.type || 'Unknown';
    }

    return 'Unknown';
  }

  loadLeaveRequests(): void {
    this.isLoading = true;
    this.usingFallbackData = false;

    this.employeeService.getLeaveRequests().subscribe({
      next: (response) => {
        console.log('Leave Requests API response:', response);

        const localStr = localStorage.getItem('local_leave_requests');
        const localRequests = localStr ? JSON.parse(localStr) : [];

        let rawList: any[] = [];
        if (response?.success && Array.isArray(response.data)) {
          rawList = response.data;
        } else if (Array.isArray(response)) {
          rawList = response;
        }

        let combined = [...localRequests, ...rawList];
        const loggedInUserStr = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
        if (loggedInUserStr) {
          const user = JSON.parse(loggedInUserStr);
          const currentUserId = user.userId || user.id || user.sub;
          const currentUserEmail = (user.email || '').toLowerCase();
          const currentUserName = (user.fullName || user.name || '').toLowerCase();

          combined = combined.filter((req: any) => {
            const reqUserId = req.employeeId || req.userId || req.employee?.id;
            const reqEmail = (req.employeeEmail || req.employee?.email || '').toLowerCase();
            const reqName = (
              req.employeeName ||
              req.employee?.fullName ||
              req.employee?.name ||
              ''
            ).toLowerCase();

            if (currentUserId && reqUserId) return String(reqUserId) === String(currentUserId);
            if (currentUserEmail && reqEmail) return reqEmail === currentUserEmail;
            if (currentUserName && reqName) return reqName === currentUserName;
            return true;
          });
        }

        this.leaveRequests = combined.map((request) => this.mapApiRequest(request));
        this.usingFallbackData = false;

        this.pageIndex = 0;
        this.updatePagedData();

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Leave Requests API error:', error);

        this.useFallbackData();

        this.pageIndex = 0;
        this.updatePagedData();

        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private mapApiRequest(request: LeaveRequestHistory): LeaveHistoryRow {
    const duration = this.calculateDuration(request.startDate, request.endDate);

    return {
      id: request.id,
      leaveType: this.formatLeaveType(request.leaveType),
      startDate: this.formatDate(request.startDate),
      endDate: this.formatDate(request.endDate),
      duration: request.duration ?? duration,
      status: request.status ?? 'Pending',
      reason: request.reason ?? 'No reason provided.',
    };
  }

  private calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const difference = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    return Math.floor(difference) + 1;
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private useFallbackData(): void {
    this.usingFallbackData = true;

    this.leaveRequests = [
      {
        id: '101',
        leaveType: 'Annual Leave',
        startDate: '10 Aug 2026',
        endDate: '17 Aug 2026',
        duration: 6,
        status: 'Pending',
        reason: 'Family summer vacation',
      },
      {
        id: '102',
        leaveType: 'Sick Leave',
        startDate: '02 Jul 2026',
        endDate: '03 Jul 2026',
        duration: 2,
        status: 'Approved',
        reason: 'Flu recovery and doctor appointment',
      },
      {
        id: '103',
        leaveType: 'Personal Leave',
        startDate: '15 Jun 2026',
        endDate: '15 Jun 2026',
        duration: 1,
        status: 'Approved',
        reason: 'Home maintenance work',
      },
      {
        id: '104',
        leaveType: 'Medical Leave',
        startDate: '20 May 2026',
        endDate: '22 May 2026',
        duration: 3,
        status: 'Approved',
        reason: 'Minor dental surgery',
      },
      {
        id: '105',
        leaveType: 'Annual Leave',
        startDate: '01 Apr 2026',
        endDate: '05 Apr 2026',
        duration: 5,
        status: 'Rejected',
        reason: 'Overlapping project deadline',
      },
      {
        id: '106',
        leaveType: 'Personal Leave',
        startDate: '25 Aug 2026',
        endDate: '25 Aug 2026',
        duration: 1,
        status: 'Pending',
        reason: 'Personal appointment',
      },
      {
        id: '107',
        leaveType: 'Sick Leave',
        startDate: '12 Mar 2026',
        endDate: '13 Mar 2026',
        duration: 2,
        status: 'Approved',
        reason: 'Illness recovery',
      },
      {
        id: '108',
        leaveType: 'Annual Leave',
        startDate: '18 Sep 2026',
        endDate: '25 Sep 2026',
        duration: 6,
        status: 'Pending',
        reason: 'Annual family trip',
      },
      {
        id: '109',
        leaveType: 'Medical Leave',
        startDate: '10 Feb 2026',
        endDate: '11 Feb 2026',
        duration: 2,
        status: 'Approved',
        reason: 'Routine medical checkup',
      },
      {
        id: '110',
        leaveType: 'Personal Leave',
        startDate: '22 Jan 2026',
        endDate: '22 Jan 2026',
        duration: 1,
        status: 'Rejected',
        reason: 'Personal arrangements',
      },
    ];
  }

  updatePagedData(): void {
    const list = this.data.length ? this.data : this.leaveRequests;

    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.pagedData = list.slice(startIndex, endIndex);

    if (this.paginator) {
      this.paginator.length = list.length;
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this.updatePagedData();
  }

  handleViewDetails(request: LeaveHistoryRow): void {
    console.log('Viewing details for request:', request);

    const id = request.id || (request as any).id;

    if (!id) {
      this.selectedRequest = request;
      this.isModalOpen = true;
      return;
    }

    this.isModalOpen = true;
    this.loadLeaveRequestById(id);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedRequest = null;

    this.cdr.detectChanges();
  }

  onView(request: LeaveHistoryRow, event: Event): void {
    event.stopPropagation();

    this.handleViewDetails(request);
    this.viewDetails.emit(request);
  }

  onCancel(id: string, event: Event): void {
    event.stopPropagation();

    this.cancelRequest.emit(id);
  }

  get totalRecords(): number {
    return this.data.length || this.leaveRequests.length;
  }
}
