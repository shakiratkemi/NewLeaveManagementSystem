import { Component, OnInit, inject, signal } from '@angular/core';
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

  // General Settings — signals so zoneless change detection actually
  // schedules a re-render when the API response updates them.
  companyName = signal<string>('SBSC LeaveFlow Inc.');
  IDnaming = signal<string>('EMP-');
  workWeekStart: string = 'Monday';
  fiscalYearStart: string = 'January';
  autoApproveDaysThreshold: number = 2;
  isLoadingOrganizationSettings: boolean = false;

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

  // Notification Settings
  emailAlertsOnNewRequest: boolean = true;
  emailAlertsOnApproval: boolean = true;
  dailyDigestEnabled: boolean = false;
  reminderDaysBeforeLeave: number = 3;
  isLoadingNotificationSettings: boolean = false;
  isUpdatingNotificationSettings: boolean = false;

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
    this.loadNotificationSettings();
    this.loadOrganizationSettings();

    const savedSettings = localStorage.getItem('hr_settings');
    if (savedSettings) {
      try {
        const {
          emailAlertsOnNewRequest,
          emailAlertsOnApproval,
          dailyDigestEnabled,
          reminderDaysBeforeLeave,
          companyName, // excluded — this is API-driven (read-only), never restore from cache
          IDnaming, // excluded — this is API-driven (read-only), never restore from cache
          ...otherSettings
        } = JSON.parse(savedSettings);
        Object.assign(this, otherSettings);
      } catch (e) {
        console.error('Error parsing settings', e);
      }
    }
    this.isLoading = false;
    this.loaderService.hide();
  }

  loadOrganizationSettings(): void {
    this.isLoadingOrganizationSettings = true;
    this.hrService.getOrganizationSettings().subscribe({
      next: (res: any) => {
        console.log('getOrganizationSettings response:', res);
        const data = res?.data || res || {};

        if (data.companyName || data.CompanyName) {
          this.companyName.set(data.companyName || data.CompanyName);
        }

        const idNamingValue =
          data.idNaming ?? data.IDNaming ?? data.codePrefix ?? data.CodePrefix;
        if (idNamingValue) {
          this.IDnaming.set(idNamingValue);
        }

        this.isLoadingOrganizationSettings = false;
      },
      error: (err: any) => {
        console.error('Error loading organization settings:', err);
        this.isLoadingOrganizationSettings = false;
      },
    });
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

  loadNotificationSettings(): void {
    this.isLoadingNotificationSettings = true;
    this.hrService.getNotificationSettings().subscribe({
      next: (res: any) => {
        console.log('GET Notification Settings response:', res);
        const data = res?.data || res || {};

        if (typeof data.enableNewLeaveRequestEmails === 'boolean') {
          this.emailAlertsOnNewRequest = data.enableNewLeaveRequestEmails;
        }

        if (typeof data.enableLeaveStatusUpdateEmails === 'boolean') {
          this.emailAlertsOnApproval = data.enableLeaveStatusUpdateEmails;
        }

        this.isLoadingNotificationSettings = false;
      },
      error: (err: any) => {
        console.error('Error fetching notification settings:', err);
        const savedSettings = localStorage.getItem('hr_settings');
        if (savedSettings) {
          try {
            const data = JSON.parse(savedSettings);
            if (typeof data.emailAlertsOnNewRequest === 'boolean') {
              this.emailAlertsOnNewRequest = data.emailAlertsOnNewRequest;
            }
            if (typeof data.emailAlertsOnApproval === 'boolean') {
              this.emailAlertsOnApproval = data.emailAlertsOnApproval;
            }
          } catch (e) {}
        }
        this.isLoadingNotificationSettings = false;
      },
    });
  }

  setActiveTab(tab: 'general' | 'leave-policy' | 'notifications' | 'company' | 'department'): void {
    this.activeTab = tab;
  }

  saveSettings(): void {
    this.isLoading = true;
    this.loaderService.show();

    const notificationPayload = {
      enableNewLeaveRequestEmails: Boolean(this.emailAlertsOnNewRequest),
      enableLeaveStatusUpdateEmails: Boolean(this.emailAlertsOnApproval),
    };

    console.log('Sending PUT Notification Settings payload:', notificationPayload);

    const settingsData = {
      workWeekStart: this.workWeekStart,
      fiscalYearStart: this.fiscalYearStart,
      autoApproveDaysThreshold: this.autoApproveDaysThreshold,
      annualLeaveAllowance: this.annualLeaveAllowance,
      sickLeaveAllowance: this.sickLeaveAllowance,
      maternityLeaveAllowance: this.maternityLeaveAllowance,
      emailAlertsOnNewRequest: this.emailAlertsOnNewRequest,
      emailAlertsOnApproval: this.emailAlertsOnApproval,
      dailyDigestEnabled: this.dailyDigestEnabled,
      reminderDaysBeforeLeave: this.reminderDaysBeforeLeave,
    };
    localStorage.setItem('hr_settings', JSON.stringify(settingsData));

    this.hrService.updateNotificationSettings(notificationPayload).subscribe({
      next: (res: any) => {
        console.log('PUT Notification Settings response:', res);
        this.isLoading = false;
        this.loaderService.hide();
        this.toastr.success('Settings saved successfully!', 'Success');
      },
      error: (err: any) => {
        console.error('Error updating notification settings:', err);
        this.isLoading = false;
        this.loaderService.hide();
        const errorMsg =
          err?.error?.message || err?.message || 'Failed to save settings. Please try again.';
        this.toastr.error(errorMsg, 'Save Failed');
      },
    });
  }
}