import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CommonModule, DatePipe } from '@angular/common';

import { Applyleave } from './apply-leave/apply-leave';
import { Employee } from '../../../core/services/data/employee/employee';
import { DashboardData } from '../../../core/interface/employee';

export type LeaveType = 'Annual' | 'Sick' | 'Medical' | 'Personal';
export type Status = 'Pending' | 'Approved' | 'Rejected';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule, Applyleave, DatePipe],
  templateUrl: './dashboard.html',
  styles: ``,
})
export class Dashboard implements OnInit {
  dashboardData: DashboardData = {
    employeeName: 'User',
    pendingRequestsCount: 0,
    approvedLeavesCount: 0,
    rejectedLeavesCount: 0,
    totalLeaveDaysRemaining: 0,
  };

  recentRequests: any[] = [];
  leaveRequests: any[] = [];

  isModalOpen = false;
  isApplyModalOpen = false;

  isLoadingDashboard = false;
  isLoadingRequests = false;

  constructor(
    private employeeService: Employee,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const userStr = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.fullName || user.name) {
        this.dashboardData.employeeName = user.fullName || user.name;
      }
    }
    this.loadDashboard();
    this.loadRecentRequests();
  }

  loadDashboard(): void {
    this.isLoadingDashboard = true;

    this.employeeService.getEmployeeDashboard().subscribe({
      next: (response: any) => {
        console.log('Dashboard response:', response);

        const data = response?.data || response || {};
        const userStr = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
        const loggedInUser = userStr ? JSON.parse(userStr) : null;
        const currentEmployeeName =
          loggedInUser?.fullName || loggedInUser?.name || loggedInUser?.employeeName || data.employeeName || 'User';

        const pendingCount = Math.max(
          data.pendingRequestsCount || 0,
          this.countByStatus('Pending'),
        );
        const approvedCount = Math.max(
          data.approvedLeavesCount || 0,
          this.countByStatus('Approved'),
        );
        const rejectedCount = Math.max(
          data.rejectedLeavesCount || 0,
          this.countByStatus('Rejected'),
        );

        this.dashboardData = {
          employeeName: currentEmployeeName,
          pendingRequestsCount: pendingCount,
          approvedLeavesCount: approvedCount,
          rejectedLeavesCount: rejectedCount,
          totalLeaveDaysRemaining: data.totalLeaveDaysRemaining ?? data.leaveBalance ?? 20,
        };

        this.isLoadingDashboard = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Dashboard API error:', error);
        this.isLoadingDashboard = false;
      },
    });
  }

  loadRecentRequests(): void {
    this.isLoadingRequests = true;

    this.employeeService.getLeaveRequests().subscribe({
      next: (response: any) => {
        console.log('Leave Requests response:', response);

        const localStr = localStorage.getItem('local_leave_requests');
        const localRequests = localStr ? JSON.parse(localStr) : [];

        let list: any[] = [...localRequests];
        if (response?.success && Array.isArray(response.data)) {
          list = [...list, ...response.data];
        } else if (Array.isArray(response)) {
          list = [...list, ...response];
        }

        // Scope to current logged-in user to prevent seeing other users' data
        const loggedInUserStr = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
        if (loggedInUserStr) {
          const user = JSON.parse(loggedInUserStr);
          const currentUserId = user.userId || user.id || user.sub;
          const currentUserEmail = (user.email || '').toLowerCase();
          const currentUserName = (user.fullName || user.name || '').toLowerCase();

          list = list.filter((req: any) => {
            const reqUserId = req.employeeId || req.userId || req.employee?.id;
            const reqEmail = (req.employeeEmail || req.employee?.email || '').toLowerCase();
            const reqName = (req.employeeName || req.employee?.fullName || req.employee?.name || '').toLowerCase();

            if (currentUserId && reqUserId) {
              return String(reqUserId) === String(currentUserId);
            }
            if (currentUserEmail && reqEmail) {
              return reqEmail === currentUserEmail;
            }
            if (currentUserName && reqName) {
              return reqName === currentUserName;
            }
            return true;
          });
        }

        this.leaveRequests = list;
        // Requirement 2: Only show NEW (Pending) leave requests on the dashboard
        this.recentRequests = list.filter(
          (req: any) => (req.status || 'Pending').toLowerCase() === 'pending',
        );

        // Update green card and secondary stat counts with actual user counts
        if (this.dashboardData) {
          const calculatedPending = this.countByStatus('Pending');
          this.dashboardData.pendingRequestsCount = Math.max(
            this.dashboardData.pendingRequestsCount || 0,
            calculatedPending,
          );
          this.dashboardData.approvedLeavesCount = Math.max(
            this.dashboardData.approvedLeavesCount || 0,
            this.countByStatus('Approved'),
          );
          this.dashboardData.rejectedLeavesCount = Math.max(
            this.dashboardData.rejectedLeavesCount || 0,
            this.countByStatus('Rejected'),
          );
        }

        this.isLoadingRequests = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Leave Requests API error:', error);
        const localStr = localStorage.getItem('local_leave_requests');
        const localRequests = localStr ? JSON.parse(localStr) : [];
        this.leaveRequests = localRequests;
        this.recentRequests = localRequests.filter(
          (req: any) => (req.status || 'Pending').toLowerCase() === 'pending',
        );

        if (this.dashboardData) {
          this.dashboardData.pendingRequestsCount = this.countByStatus('Pending');
        }

        this.isLoadingRequests = false;
        this.cdr.detectChanges();
      },
    });
  }

  private countByStatus(statusStr: string): number {
    return this.leaveRequests.filter(
      (r) => (r.status || 'Pending').toLowerCase() === statusStr.toLowerCase(),
    ).length;
  }

  handleLeaveSubmit(request: any): void {
    this.employeeService.createLeaveRequest(request).subscribe({
      next: (response: any) => {
        console.log('Leave request submitted:', response);
        this.loadRecentRequests();
        this.closeApplyModal();
      },
      error: (error) => {
        console.error('Leave request submit error:', error);
        this.loadRecentRequests();
        this.closeApplyModal();
      },
    });
  }

  openApplyModal(): void {
    this.isApplyModalOpen = true;
  }

  closeApplyModal(): void {
    this.isApplyModalOpen = false;
    this.cdr.detectChanges();
  }
}