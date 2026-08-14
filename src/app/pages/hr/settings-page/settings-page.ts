import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { Loader } from '../../../core/services/loader';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css',
})
export class SettingsPage implements OnInit {
  private loaderService = inject(Loader);
  private toastr = inject(ToastrService);

  isLoading: boolean = false;
  activeTab: 'general' | 'leave-policy' | 'notifications' | 'company' | 'department' = 'general';

  // General Settings
  companyName: string = 'SBSC LeaveFlow Inc.';
  IDnaming: string = 'EMP-';
  workWeekStart: string = 'Monday';
  fiscalYearStart: string = 'January';
  autoApproveDaysThreshold: number = 2;

  // Leave Policy Settings
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
  teamLeads: string[] = [
    'Alex Johnson',
    'Sarah Williams',
    'Michael Chen',
    'Emily Davis',
    'David Miller',
    'Jessica Taylor',
  ];
  departmentsList: string[] = ['Engineering', 'Design', 'Marketing', 'Human Resources', 'Sales'];

  ngOnInit(): void {
    this.isLoading = true;
    this.loaderService.show();

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

  setActiveTab(tab: 'general' | 'leave-policy' | 'notifications' | 'company' | 'department'): void {
    this.activeTab = tab;
  }

  addDepartment(): void {
    if (this.newDepartmentName.trim()) {
      const deptName = this.newDepartmentName.trim();
      this.departmentsList.push(deptName);
      this.newDepartmentName = '';
      this.selectedTeamLead = '';
      this.toastr.success(`Department "${deptName}" created successfully!`, 'Success');
    }
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
