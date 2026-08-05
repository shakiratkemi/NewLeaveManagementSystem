import { Component, OnInit, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

export interface HrLeaveRecord {
  requestId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: 'Annual' | 'Sick' | 'Casual' | 'Unpaid';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  appliedOn: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approverName?: string;
  approverRemarks?: string;
  contactDetails?: string;
}

@Component({
  selector: 'app-leave-request',
  imports: [CommonModule, FormsModule, MatPaginatorModule],
  templateUrl: './leave-request.html',
  styles: ``,
})
export class LeaveRequest implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  
  allRecords = signal<HrLeaveRecord[]>([]);

  
  searchTerm = signal<string>('');
  selectedStatusFilter = signal<string>('ALL');
  selectedDepartmentFilter = signal<string>('ALL');
  selectedTypeFilter = signal<string>('ALL');
  pageSize = signal<number>(10);
  pageIndex = signal<number>(0);

  selectedRecord = signal<HrLeaveRecord | null>(null);

  filteredRecords = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.selectedStatusFilter();
    const dept = this.selectedDepartmentFilter();
    const type = this.selectedTypeFilter();

    return this.allRecords().filter((record) => {
      const matchesSearch =
        !search ||
        record.employeeName.toLowerCase().includes(search) ||
        record.employeeId.toLowerCase().includes(search) ||
        record.requestId.toLowerCase().includes(search) ||
        record.reason.toLowerCase().includes(search);

      const matchesStatus = status === 'ALL' || record.status === status;
      const matchesDept = dept === 'ALL' || record.department === dept;
      const matchesType = type === 'ALL' || record.leaveType === type;

      return matchesSearch && matchesStatus && matchesDept && matchesType;
    });
  });

  // Computed signal to slice data for current page view
  paginatedRecords = computed(() => {
    const startIndex = this.pageIndex() * this.pageSize();
    return this.filteredRecords().slice(startIndex, startIndex + this.pageSize());
  });

  ngOnInit(): void {
    this.allRecords.set([
      {
        requestId: 'LV-9041',
        employeeId: 'EMP-104',
        employeeName: 'Sarah Jenkins',
        department: 'Engineering',
        leaveType: 'Annual',
        startDate: '2026-08-15',
        endDate: '2026-08-22',
        days: 6,
        reason: 'Summer family vacation trip.',
        appliedOn: '2026-08-01',
        status: 'Pending',
        contactDetails: 'Available via phone (+1 555-0192)',
      },
      {
        requestId: 'LV-8920',
        employeeId: 'EMP-211',
        employeeName: 'David Chen',
        department: 'Product',
        leaveType: 'Sick',
        startDate: '2026-07-28',
        endDate: '2026-07-30',
        days: 3,
        reason: 'Recovering from viral infection.',
        appliedOn: '2026-07-27',
        status: 'Approved',
        approverName: 'Marcus Vance',
        approverRemarks: 'Medical note submitted to HR.',
      },
      {
        requestId: 'LV-8812',
        employeeId: 'EMP-089',
        employeeName: 'Amara Okafor',
        department: 'Human Resources',
        leaveType: 'Casual',
        startDate: '2026-07-10',
        endDate: '2026-07-10',
        days: 1,
        reason: 'Personal urgent family business.',
        appliedOn: '2026-07-05',
        status: 'Approved',
        approverName: 'Elena Rostova',
      },
      {
        requestId: 'LV-8701',
        employeeId: 'EMP-305',
        employeeName: 'Michael Scott',
        department: 'Sales',
        leaveType: 'Annual',
        startDate: '2026-06-01',
        endDate: '2026-06-14',
        days: 10,
        reason: 'Extended travel.',
        appliedOn: '2026-05-12',
        status: 'Rejected',
        approverName: 'Karen Filippelli',
        approverRemarks: 'Conflicts with Q2 closing schedule.',
      },
    ]);
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }

  onFilterChange(): void {
    // Reset to the first page on any filter change
    this.pageIndex.set(0);
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatusFilter.set('ALL');
    this.selectedDepartmentFilter.set('ALL');
    this.selectedTypeFilter.set('ALL');
    this.onFilterChange();
  }

  openDetailsModal(record: HrLeaveRecord): void {
    this.selectedRecord.set(record);
  }

  closeDetailsModal(): void {
    this.selectedRecord.set(null);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 ring-rose-600/20';
      default:
        return 'bg-slate-50 text-slate-700 ring-slate-600/20';
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
