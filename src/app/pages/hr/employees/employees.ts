import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { AddEmployee } from './add-employee/add-employee';
import { HrService } from '../../../core/services/data/hr/hr-service';
import { AuthService } from '../../../core/services/auth-service';
import {
  EditEmployeeProfile,
  EmployeeFormData,
  EmployeeFormPayload,
  EmployeeRecord,
} from '../../../core/interface/hr';
import { EditEmployee } from './edit-employee/edit-employee';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule, AddEmployee, EditEmployee],
  templateUrl: './employees.html',
  styles: ``,
})
export class Employees implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  employees: EmployeeRecord[] = [];
  searchQuery: string = '';
  selectedDepartment: string = 'All';
  selectedStatus: string = 'All';
  selectedEmployeeForModal: EmployeeRecord | null = null;
  selectedEmployeeForEdit: EditEmployeeProfile | null = null;
  isAddModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isSubmitting: boolean = false;
  newEmployee: Partial<EmployeeFormData> = {
    name: '',
    email: '',
    role: '',
    department: 'Engineering',
    designation: '',
    totalAnnualLeave: 20,
    totalSickLeave: 10,
    status: 'Active',
  };

  pageSize: number = 10;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [5, 10, 20, 30];

  readonly departments: string[] = [
    'All',
    'Engineering',
    'Product',
    'Marketing',
    'Human Resources',
    'Sales',
  ];
  readonly statuses: string[] = ['All', 'Active', 'On Leave', 'Inactive'];

  constructor(
    private hrService: HrService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.paginator.page.subscribe({
        next: (event: PageEvent) => {
          this.pageIndex = event.pageIndex;
          this.pageSize = event.pageSize;
        },
      });
    }
  }

  get filteredEmployees(): EmployeeRecord[] {
    const query = this.searchQuery.toLowerCase().trim();
    return this.employees.filter((emp) => {
      const matchesSearch =
        !query ||
        emp.name.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query);

      const matchesDept =
        this.selectedDepartment === 'All' || emp.department === this.selectedDepartment;

      const matchesStatus = this.selectedStatus === 'All' || emp.status === this.selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }

  get pagedEmployees(): EmployeeRecord[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredEmployees.slice(startIndex, startIndex + this.pageSize);
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  openLeaveModal(employee: EmployeeRecord): void {
    this.selectedEmployeeForModal = employee;
  }

  closeLeaveModal(): void {
    this.selectedEmployeeForModal = null;
  }

  openAddEmployeeModal(): void {
    this.isAddModalOpen = true;
  }

  closeAddEmployeeModal(): void {
    this.isAddModalOpen = false;
    // this.resetNewEmployeeForm();
  }

  openEditProfileModal(emp: EmployeeRecord): void {
    this.selectedEmployeeForEdit = {
      email: emp.email,
      fullName: emp.name,
      department: emp.department,
      designation: emp.role,
    };
    this.isEditModalOpen = true;
  }

  closeEditProfileModal(): void {
    this.isEditModalOpen = false;
    this.selectedEmployeeForEdit = null;
  }

  handleUpdateProfile(payload: EditEmployeeProfile): void {
    this.isSubmitting = true;

    this.hrService.editUserProfile(payload).subscribe({
      next: (res) => {
        console.log('Profile updated successfully:', res);
        this.isSubmitting = false;
        this.closeEditProfileModal();
        this.loadEmployees(); // Reload table data
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        this.isSubmitting = false;
      },
    });
  }

  saveNewEmployee(): void {
    if (!this.newEmployee.name || !this.newEmployee.email || !this.newEmployee.role) {
      return;
    }

    const createdEmployee: EmployeeRecord = {
      id: `EMP-00${this.employees.length + 1}`,
      name: this.newEmployee.name,
      email: this.newEmployee.email,
      role: this.newEmployee.role,
      department: this.newEmployee.department || 'Engineering',
      designation: this.newEmployee.designation || 'Employee',
      annualLeaveBalance: this.newEmployee.totalAnnualLeave || 20,
      totalAnnualLeave: this.newEmployee.totalAnnualLeave || 20,
      sickLeaveBalance: this.newEmployee.totalSickLeave || 10,
      totalSickLeave: this.newEmployee.totalSickLeave || 10,
      status: this.newEmployee.status || 'Active',
    } as EmployeeRecord;

    this.employees = [createdEmployee, ...this.employees];
    this.closeAddEmployeeModal();
  }

  handleSaveEmployee(formData: EmployeeFormPayload): void {
    console.log('Employees.handleSaveEmployee called', formData);
    this.isSubmitting = true;

    this.authService.createEmployee(formData).subscribe({
      next: (res) => {
        console.log('Employee created successfully:', res);
        this.isSubmitting = false;
        this.closeAddEmployeeModal();
        this.loadEmployees();
      },
      error: (err) => {
        console.error('Failed to create employee:', err);
        this.isSubmitting = false;
      },
    });
  }

  private submitRegistration(payload: Record<string, any>): void {
    this.isSubmitting = true;
    this.authService.createEmployee(payload).subscribe({
      next: (res) => {
        console.log('Employee created successfully:', res);
        this.isSubmitting = false;
        this.closeAddEmployeeModal();
        this.loadEmployees(); // Reload list to fetch newly created employee from backend
      },
      error: (err) => {
        console.error('Failed to create employee:', err);
        this.isSubmitting = false;
      },
    });
  }

  private resetNewEmployeeForm(): void {
    this.newEmployee = {
      name: '',
      email: '',
      role: 'Employee',
      department: 'Engineering',
      designation: '',
      totalAnnualLeave: 20,
      totalSickLeave: 10,
      status: 'Active',
    };
  }

  // handleSaveEmployee(formData: EmployeeFormData): void {
  //   const createdEmployee: EmployeeRecord = {
  //     id: `EMP-00${this.employees.length + 1}`,
  //     name: formData.name,
  //     email: formData.email,
  //     role: formData.role,
  //     department: formData.department || 'Engineering',
  //     designation: formData.designation || 'Employee',
  //     password: formData.password || '',
  //   };

  //   this.employees = [createdEmployee, ...this.employees];
  // }

  private loadEmployees(): void {
    this.hrService.getAllEmployees().subscribe({
      next: (response: any) => {
        console.log('getAllEmployees response:', response);
        let list: any[] = [];

        if (Array.isArray(response)) {
          list = response;
        } else if (Array.isArray(response?.data)) {
          list = response.data;
        } else if (Array.isArray(response?.data?.data)) {
          list = response.data.data;
        } else if (Array.isArray(response?.users)) {
          list = response.users;
        } else if (Array.isArray(response?.data?.users)) {
          list = response.data.users;
        } else {
          // Try to find the first array property on the response
          for (const key of Object.keys(response || {})) {
            if (Array.isArray(response[key])) {
              list = response[key];
              break;
            }
          }
        }
        if (!Array.isArray(list)) list = [];
        this.employees = list.map((item: any, index: number) => this.mapEmployee(item, index));
        console.log('Employees mapped:', this.employees);
        try {
          this.cdr.detectChanges();
        } catch (e) {
          console.warn('detectChanges failed', e);
        }
      },
      error: (err) => {
        console.error('Failed to load employees', err);
        this.employees = [];
      },
    });
  }

  private mapEmployee(item: any, index: number): EmployeeRecord {
    return {
      id: item.id ?? item.employeeId ?? item.userId ?? `EMP-00${index + 1}`,
      name: item.fullName ?? item.name ?? item.employeeName ?? item.userName ?? 'Unknown Employee',
      email: item.email ?? item.employeeEmail ?? item.userEmail ?? 'N/A',
      role: item.role ?? item.jobTitle ?? item.designation ?? 'Employee',
      department: item.department ?? item.designation ?? 'Engineering',
      annualLeaveBalance: Number(
        item.annualLeaveBalance ?? item.remainingAnnualLeave ?? item.annualLeave ?? 20,
      ),
      totalAnnualLeave: Number(item.totalAnnualLeave ?? item.annualLeaveQuota ?? 20),
      sickLeaveBalance: Number(
        item.sickLeaveBalance ?? item.remainingSickLeave ?? item.sickLeave ?? 10,
      ),
      totalSickLeave: Number(item.totalSickLeave ?? item.sickLeaveQuota ?? 10),
      status: this.normalizeStatus(item.status ?? item.employeeStatus),
    };
  }

  private normalizeStatus(status: unknown): EmployeeRecord['status'] {
    if (status === 'Active' || status === 'On Leave' || status === 'Inactive') {
      return status;
    }

    return 'Active';
  }

  getStatusBadgeClass(status: EmployeeRecord['status']): string {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'On Leave':
        return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'Inactive':
        return 'bg-slate-100 text-slate-600 ring-slate-500/20';
    }
  }
}
