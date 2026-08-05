import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MOCK_LEAVE_REQUESTS } from '../leave-history/leave-history';
import { CommonModule } from '@angular/common';
import { LeaveHistoryDetails } from '../leave-history/leave-history-details/leave-history-details';
import { Applyleave } from './apply-leave/apply-leave';

export interface DashboardSummary {
  daysRemaining: number;
  pendingLeaveRequests: number;
  approvedLeaveRequests: number;
  rejectedLeaveRequests: number;
}

export type LeaveType = 'Annual' | 'Sick' | 'Medical' | 'Personal';
export type Status = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  duration: number;
  status: Status;
  reason: string;
}

export interface LeaveBalance {
  leaveType: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface Biodata {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  jobTitle: string;
  department: string;
  employeeId: string;
  startDate: any;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule, LeaveHistoryDetails, Applyleave],
  templateUrl: './dashboard.html',
  styles: ``,
})
export class Dashboard {
  private totalAnnualLeave = 20;
  leaveRequests: LeaveRequest[] = [...MOCK_LEAVE_REQUESTS];

  selectedRequest: LeaveRequest | null = null;
  isModalOpen = false;
  isApplyModalOpen = false;

  userProfile: Biodata = {
    name: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    phoneNumber: '+1 (555) 019-2834',
    address: '2233 Sunrise Road, Suite 400, Austin, TX 78701',
    jobTitle: 'Senior UI/UX Engineer',
    department: 'Engineering',
    employeeId: 'EMP-4082',
    startDate: '2023-01-15',
  };
  constructor(private cdr: ChangeDetectorRef) {}
  get firstName(): string {
    return this.userProfile.name.split(' ')[0];
  }

  get dashboardItems(): DashboardSummary {
    const pending = this.leaveRequests.filter((r) => r.status === 'Pending').length;
    const approved = this.leaveRequests.filter((r) => r.status === 'Approved').length;
    const rejected = this.leaveRequests.filter((r) => r.status === 'Rejected').length;
    const usedDays = this.leaveRequests
      .filter((r) => r.status === 'Approved')
      .reduce((sum, r) => sum + r.duration, 0);

    return {
      daysRemaining: this.totalAnnualLeave - usedDays,
      pendingLeaveRequests: pending,
      approvedLeaveRequests: approved,
      rejectedLeaveRequests: rejected,
    };
  }

  get recentRequests(): LeaveRequest[] {
    return this.leaveRequests.slice(0, 3);
  }
  handleViewDetails(request: LeaveRequest): void {
    this.selectedRequest = request;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedRequest = null;
    this.cdr.detectChanges();
  }

  openApplyModal(): void {
    this.isApplyModalOpen = true;
  }

  closeApplyModal(): void {
    this.isApplyModalOpen = false;
    this.cdr.detectChanges();
  }

  handleLeaveSubmit(newRequest: Partial<LeaveRequest>): void {
    const createdRequest: LeaveRequest = {
      id: this.leaveRequests.length ? Math.max(...this.leaveRequests.map((r) => r.id)) + 1 : 101,
      leaveType: newRequest.leaveType || 'Annual',
      startDate: newRequest.startDate || '',
      endDate: newRequest.endDate || '',
      duration: newRequest.duration || 1,
      status: 'Pending',
      reason: newRequest.reason || '',
    };
    MOCK_LEAVE_REQUESTS.unshift(createdRequest);
    this.leaveRequests = [createdRequest, ...this.leaveRequests];
    this.closeApplyModal();
  }
}
