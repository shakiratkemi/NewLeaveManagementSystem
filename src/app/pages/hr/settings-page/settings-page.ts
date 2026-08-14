import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { Loader } from '../../../core/services/loader';
import { HrService } from '../../../core/services/data/hr/hr-service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './settings-page.html',
})
export class SettingsPage implements OnInit {
  private loaderService = inject(Loader);
  private toastr = inject(ToastrService);
  private hrService = inject(HrService);

  isLoading: boolean = false;
  activeTab: 'general' | 'leave-policy' | 'notifications' | 'company' | 'department' = 'general';

  // General Settings
  companyName: string = 'SBSC LeaveFlow Inc.';
  IDnaming: string = 'EMP-';
  workWeekStart: string = 'Monday';
  fiscalYearStart: string = 'January';
  autoApproveDaysThreshold: number = 2;

  // Leave Policy Settings (Create Leave Type)
  newLeaveTypeName: string = '';
  newLeaveTypeDefaultDays: number | null = null;
  isSubmittingLeaveType: boolean = false;
  leaveTypesList: any[] = [];
  isLoadingLeaveTypes: boolean = false;

  // Legacy Leave Policy Inputs
  annualLeaveAllowance: number = 20;
  sickLeaveAllowance: number = 10;
  maternityLeaveAllowance: number = 90;
  paternityLeaveAllowance: number = 14;

  // Notification Settings
  emailAlertsOnNewRequest: boolean = true;
  emailAlertsOnApproval: boolean = true;
  dailyDigestEnabled: boolean = false;
  reminderDaysBeforeLeave: number = 3;

  // Department Settings
  newDepartmentName: string = '';
  selectedTeamLead: string = '';
  usersList: any[] = [];
  isLoadingUsers: boolean = false;
  departmentsList: any[] = [];
  isLoadingDepartments: boolean = false;
  isSubmittingDepartment: boolean = false;

  ngOnInit(): void {
    this.isLoading = true;
    this.loaderService.show();
    this.loadLeaveTypes();
    this.loadUsers();
    this.loadDepartments();

    setTimeout(() => {
      const savedSettings = localStorage.getItem('hr_settings');
      if (savedSettings) {
        try {
          const data = JSON.parse(savedSettings);
          Object.assign(this, data);
        } catch (e) {
          console.error('Error parsing settings', e);
        }
      }
      this.isLoading = false;
      this.loaderService.hide();
    }, 400);
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.hrService.getUsers().subscribe({
      next: (res: any) => {
        let list: any[] = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;
        else if (Array.isArray(res?.users)) list = res.users;
        else {
          for (const k of Object.keys(res || {})) {
            if (Array.isArray(res[k])) {
              list = res[k];
              break;
            }
          }
        }
        this.usersList = list.map((u: any) => ({
          id: u.id || u.userId || '',
          fullName: u.fullName || u.name || u.employeeName || 'Unknown User',
          email: u.email || '',
        }));
        this.isLoadingUsers = false;
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.isLoadingUsers = false;
      },
    });
  }

  loadDepartments(): void {
    this.isLoadingDepartments = true;
    this.hrService.getDepartments().subscribe({
      next: (res: any) => {
        let list: any[] = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;
        else if (Array.isArray(res?.departments)) list = res.departments;
        else {
          for (const k of Object.keys(res || {})) {
            if (Array.isArray(res[k])) {
              list = res[k];
              break;
            }
          }
        }
        this.departmentsList = list;
        this.isLoadingDepartments = false;
      },
      error: (err: any) => {
        console.error('Error loading departments:', err);
        this.isLoadingDepartments = false;
      },
    });
  }

  addDepartment(): void {
    if (!this.newDepartmentName.trim()) {
      this.toastr.warning('Please enter a department name.', 'Validation Error');
      return;
    }

    const payload: any = {
      name: this.newDepartmentName.trim(),
    };

    if (this.selectedTeamLead) {
      payload.teamLeadName = this.selectedTeamLead;
      const foundUser = this.usersList.find((u) => u.fullName === this.selectedTeamLead);
      if (foundUser?.id) {
        payload.teamLeadId = foundUser.id;
      }
    }

    this.isSubmittingDepartment = true;
    this.hrService.createDepartment(payload).subscribe({
      next: (res: any) => {
        const deptName = payload.name;
        this.toastr.success(`Department "${deptName}" created successfully!`, 'Success');
        this.newDepartmentName = '';
        this.selectedTeamLead = '';
        this.isSubmittingDepartment = false;
        this.loadDepartments();
      },
      error: (err: any) => {
        console.error('Error creating department:', err);
        const errorMsg =
          err?.error?.message || err?.message || 'Failed to create department. Please try again.';
        this.toastr.error(errorMsg, 'Creation Failed');
        this.isSubmittingDepartment = false;
      },
    });
  }

  loadLeaveTypes(): void {
    this.isLoadingLeaveTypes = true;
    this.hrService.getLeaveTypes().subscribe({
      next: (res: any) => {
        console.log('getLeaveTypes response:', res);
        let list: any[] = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;
        else if (Array.isArray(res?.leaveTypes)) list = res.leaveTypes;
        else {
          for (const k of Object.keys(res || {})) {
            if (Array.isArray(res[k])) {
              list = res[k];
              break;
            }
          }
        }
        this.leaveTypesList = list;
        this.isLoadingLeaveTypes = false;
      },
      error: (err: any) => {
        console.error('Error loading leave types:', err);
        this.isLoadingLeaveTypes = false;
      },
    });
  }

  createLeaveType(): void {
    if (!this.newLeaveTypeName.trim()) {
      this.toastr.warning('Please enter a leave type name.', 'Validation Error');
      return;
    }

    if (
      this.newLeaveTypeDefaultDays === null ||
      this.newLeaveTypeDefaultDays === undefined ||
      this.newLeaveTypeDefaultDays <= 0
    ) {
      this.toastr.warning('Please enter a valid number of default days.', 'Validation Error');
      return;
    }

    const payload = {
      name: this.newLeaveTypeName.trim(),
      defaultDays: Number(this.newLeaveTypeDefaultDays),
    };

    this.isSubmittingLeaveType = true;
    this.hrService.createLeaveType(payload).subscribe({
      next: (res: any) => {
        console.log('createLeaveType response:', res);
        this.toastr.success(`Leave type "${payload.name}" created successfully!`, 'Success');
        this.newLeaveTypeName = '';
        this.newLeaveTypeDefaultDays = null;
        this.isSubmittingLeaveType = false;
        this.loadLeaveTypes();
      },
      error: (err: any) => {
        console.error('Error creating leave type:', err);
        const errorMsg =
          err?.error?.message || err?.message || 'Failed to create leave type. Please try again.';
        this.toastr.error(errorMsg, 'Creation Failed');
        this.isSubmittingLeaveType = false;
      },
    });
  }

  setActiveTab(tab: 'general' | 'leave-policy' | 'notifications' | 'company' | 'department'): void {
    this.activeTab = tab;
  }

  saveSettings(): void {
    this.isLoading = true;
    this.loaderService.show();

    setTimeout(() => {
      const settingsData = {
        companyName: this.companyName,
        IDnaming: this.IDnaming,
        workWeekStart: this.workWeekStart,
        fiscalYearStart: this.fiscalYearStart,
        autoApproveDaysThreshold: this.autoApproveDaysThreshold,
        annualLeaveAllowance: this.annualLeaveAllowance,
        sickLeaveAllowance: this.sickLeaveAllowance,
        maternityLeaveAllowance: this.maternityLeaveAllowance,
        paternityLeaveAllowance: this.paternityLeaveAllowance,
        emailAlertsOnNewRequest: this.emailAlertsOnNewRequest,
        emailAlertsOnApproval: this.emailAlertsOnApproval,
        dailyDigestEnabled: this.dailyDigestEnabled,
        reminderDaysBeforeLeave: this.reminderDaysBeforeLeave,
      };

      localStorage.setItem('hr_settings', JSON.stringify(settingsData));
      this.isLoading = false;
      this.loaderService.hide();

      this.toastr.success('Settings saved successfully!', 'Success');
    }, 500);
  }
}
