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
  dashboardData!: DashboardData;

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
    this.loadDashboard();
    this.loadRecentRequests();
  }

  loadDashboard(): void {
    this.isLoadingDashboard = true;

    this.employeeService.getEmployeeDashboard().subscribe({
      next: (response: DashboardData) => {
        console.log('Dashboard response:', response);

        this.dashboardData = response;

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

        if (response?.success && Array.isArray(response.data)) {
          this.recentRequests = response.data;

          // this.leaveRequests = response.data;
        } else {
          this.recentRequests = [];
          this.leaveRequests = [];
        }

        this.isLoadingRequests = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Leave Requests API error:', error);

        this.recentRequests = [];
        this.leaveRequests = [];

        this.isLoadingRequests = false;
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

  openApplyModal(): void {
    this.isApplyModalOpen = true;
  }

  closeApplyModal(): void {
    this.isApplyModalOpen = false;
    this.cdr.detectChanges();
  }
}
