import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { Employee } from '../../../core/interface/employee';
import { AddEmployee } from './add-employee/add-employee';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule, AddEmployee],
  templateUrl: './employees.html',
  styles: ``,
})
export class Employees implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  employees: Employee[] = [];
  searchQuery: string = '';
  selectedDepartment: string = 'All';
  selectedStatus: string = 'All';
  selectedEmployeeForModal: Employee | null = null;
  isAddModalOpen: boolean = false;
  newEmployee: Partial<Employee> = {
    name: '',
    email: '',
    role: '',
    department: 'Engineering',
    totalAnnualLeave: 20,
    totalSickLeave: 10,
    status: 'Active',
  };

  pageSize: number = 5;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [5, 10, 20];

  readonly departments: string[] = [
    'All',
    'Engineering',
    'Product',
    'Marketing',
    'Human Resources',
    'Sales',
  ];
  readonly statuses: string[] = ['All', 'Active', 'On Leave', 'Inactive'];

  ngOnInit(): void {
    this.loadMockEmployees();
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

  get filteredEmployees(): Employee[] {
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

  // Slice Filtered Data for MatPaginator Display
  get pagedEmployees(): Employee[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredEmployees.slice(startIndex, startIndex + this.pageSize);
  }

  // Filter Change Handlers (Reset to Page 1 on filter update)
  onFilterChange(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  // View Details Modal State
  openLeaveModal(employee: Employee): void {
    this.selectedEmployeeForModal = employee;
  }

  closeLeaveModal(): void {
    this.selectedEmployeeForModal = null;
  }

  // Add Employee Modal State
  openAddEmployeeModal(): void {
    this.isAddModalOpen = true;
  }

  closeAddEmployeeModal(): void {
    this.isAddModalOpen = false;
    this.resetNewEmployeeForm();
  }

  saveNewEmployee(): void {
    if (!this.newEmployee.name || !this.newEmployee.email || !this.newEmployee.role) {
      return;
    }

    const createdEmployee: Employee = {
      id: `EMP-00${this.employees.length + 1}`,
      name: this.newEmployee.name,
      email: this.newEmployee.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(this.newEmployee.name)}`,
      role: this.newEmployee.role,
      department: this.newEmployee.department || 'Engineering',
      annualLeaveBalance: this.newEmployee.totalAnnualLeave || 20,
      totalAnnualLeave: this.newEmployee.totalAnnualLeave || 20,
      sickLeaveBalance: this.newEmployee.totalSickLeave || 10,
      totalSickLeave: this.newEmployee.totalSickLeave || 10,
      status: (this.newEmployee.status as Employee['status']) || 'Active',
    };

    this.employees = [createdEmployee, ...this.employees];
    this.closeAddEmployeeModal();
  }

  private resetNewEmployeeForm(): void {
    this.newEmployee = {
      name: '',
      email: '',
      role: '',
      department: 'Engineering',
      totalAnnualLeave: 20,
      totalSickLeave: 10,
      status: 'Active',
    };
  }

  handleSaveEmployee(
    formData: Omit<Employee, 'id' | 'avatar' | 'annualLeaveBalance' | 'sickLeaveBalance'>,
  ): void {
    const createdEmployee: Employee = {
      ...formData,
      id: `EMP-00${this.employees.length + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name)}`,
      annualLeaveBalance: formData.totalAnnualLeave,
      sickLeaveBalance: formData.totalSickLeave,
    };

    this.employees = [createdEmployee, ...this.employees];
  }

  getStatusBadgeClass(status: Employee['status']): string {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'On Leave':
        return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'Inactive':
        return 'bg-slate-100 text-slate-600 ring-slate-500/20';
    }
  }

  private loadMockEmployees(): void {
    this.employees = [
      {
        id: 'EMP-001',
        name: 'Sarah Jenkins',
        email: 'sarah.j@company.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        role: 'Senior Frontend Engineer',
        department: 'Engineering',
        annualLeaveBalance: 12,
        totalAnnualLeave: 20,
        sickLeaveBalance: 8,
        totalSickLeave: 10,
        status: 'On Leave',
      },
      {
        id: 'EMP-002',
        name: 'Marcus Chen',
        email: 'marcus.c@company.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        role: 'Lead Product Manager',
        department: 'Product',
        annualLeaveBalance: 18,
        totalAnnualLeave: 20,
        sickLeaveBalance: 10,
        totalSickLeave: 10,
        status: 'Active',
      },
      {
        id: 'EMP-003',
        name: 'Amara Okonjo',
        email: 'amara.o@company.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'Marketing Specialist',
        department: 'Marketing',
        annualLeaveBalance: 5,
        totalAnnualLeave: 18,
        sickLeaveBalance: 6,
        totalSickLeave: 10,
        status: 'Active',
      },
      {
        id: 'EMP-004',
        name: 'David Miller',
        email: 'david.m@company.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        role: 'DevOps Lead',
        department: 'Engineering',
        annualLeaveBalance: 15,
        totalAnnualLeave: 20,
        sickLeaveBalance: 9,
        totalSickLeave: 10,
        status: 'Active',
      },
    ];
  }
}
