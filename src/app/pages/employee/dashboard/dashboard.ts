import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';
import { LeaveHistoryDetails } from '../leave-history/leave-history-details/leave-history-details';
// import { Applyleave } from './apply-leave/apply-leave';
import { Employee } from '../../../core/services/data/employee/employee';
import { DashboardData } from '../../../core/interface/employee';

export type LeaveType = 'Annual' | 'Sick' | 'Medical' | 'Personal';
export type Status = 'Pending' | 'Approved' | 'Rejected';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule, LeaveHistoryDetails],
  templateUrl: './dashboard.html',
  styles: ``,
})
export class Dashboard implements OnInit {
  dashboardData!: DashboardData;

  recentRequests: any[] = [];

  isModalOpen: boolean = false;
  isApplyModalOpen = false;

  constructor(
    private employeeService: Employee,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
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

  openApplyModal(): void {
    this.isApplyModalOpen = true;
  }

  closeApplyModal(): void {
    this.isApplyModalOpen = false;
    this.cdr.detectChanges();
  }
}
