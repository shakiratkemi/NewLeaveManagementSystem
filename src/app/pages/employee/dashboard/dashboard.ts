import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CommonModule, DatePipe } from '@angular/common';
// import { LeaveHistoryDetails } from '../leave-history/leave-history-details/leave-history-details';
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
  dashboardData!: DashboardData;

  recentRequests: any[] = [];
  leaveRequests: any[] = [];

  isModalOpen: boolean = false;
  isApplyModalOpen = false;

  constructor(
    private employeeService: Employee,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.leaveRequest();
  }

  loadDashboard(): void {
    this.employeeService.getEmployeeDashboard().subscribe({
      next: (response) => {
        console.log('Dashboard response:', response);

        this.dashboardData = response;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Dashboard API error:', error);
      },
    });
  }

  handleLeaveSubmit(request: any): void {
    this.employeeService.createLeaveRequest(request).subscribe({
      next: (response: any) => {
        console.log('Leave request submitted:', response);
        this.leaveRequests = response.data;
        this.closeApplyModal();
      },
      error: (error) => {
        console.error('Leave request submit error:', error);
      },
    });
  }

  leaveRequest(): void {
    this.employeeService.getLeaveRequests().subscribe({
      next: (response: any) => {
        this.recentRequests = response.data;
      },
      error: (error) => {
        console.error('Leave Requests API error:', error);
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
