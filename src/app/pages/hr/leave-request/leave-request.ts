import { Component, OnInit, ViewChild, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HrService } from '../../../core/services/data/hr/hr-service';
import { HrLeaveRecord } from '../../../core/interface/hr';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-leave-request',
  imports: [CommonModule, FormsModule, MatPaginatorModule, DatePipe],
  templateUrl: './leave-request.html',
  styles: ``,
})
export class LeaveRequest implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  allRecords = signal<HrLeaveRecord[]>([]);
  searchTerm = signal<string>('');
  selectedStatusFilter = signal<string>('ALL');
  departments: string[] = ['ALL'];
  leaveTypes: string[] = ['ALL'];
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
      const matchesType = type === 'ALL' || record.leaveTypeName === type;

      return matchesSearch && matchesStatus && matchesDept && matchesType;
    });
  });

  // Computed signal to slice data for current page view
  paginatedRecords = computed(() => {
    const startIndex = this.pageIndex() * this.pageSize();
    return this.filteredRecords().slice(startIndex, startIndex + this.pageSize());
  });

  ngOnInit(): void {
    this.loadLeaveRequests();
    this.loadDepartments();
    this.loadLeaveTypes();
  }

  constructor(
    private hrService: HrService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {}

  // Track processing requests to disable buttons during network calls
  processing = new Set<string>();

  loadLeaveRequests(): void {
    this.hrService.getAllLeaveRequests().subscribe({
      next: (res: any) => {
        console.log('HR LeaveRequests response:', res);
        const localStr = localStorage.getItem('local_leave_requests');
        const localRequests = localStr ? JSON.parse(localStr) : [];

        let rawRecords: any[] = [];
        if (Array.isArray(res)) rawRecords = res;
        else if (Array.isArray(res?.data)) rawRecords = res.data;
        else if (Array.isArray(res?.leaveRequests)) rawRecords = res.leaveRequests;

        const combined = [...localRequests, ...rawRecords];
        const mappedRecords = combined.map((record: any) => ({
          requestId: record.id || record.requestId || '',
          employeeId: record.employeeId || record.employee?.id || '',
          employeeName:
            record.employeeName ||
            record.employee?.fullName ||
            record.employee?.name ||
            'Unknown',
          department: record.department || record.employee?.department || 'General',
          leaveTypeName: record.leaveTypeName || record.leaveType?.name || record.type || 'Leave',
          startDate: record.startDate || record.createdAt || '',
          endDate: record.endDate || '',
          days: record.numberOfDays ?? record.duration ?? record.days ?? 0,
          reason: record.reason || '',
          appliedOn: record.createdAt || '',
          status: record.status || 'Pending',
          approverName: record.managerComments ? 'Manager' : undefined,
          approverRemarks: record.managerComments || undefined,
          contactDetails: record.employee?.email || undefined,
        }));

        this.allRecords.set(mappedRecords as HrLeaveRecord[]);
      },
      error: (err: any) => {
        console.error('HR getAllLeaveRequests error:', err);
        const localStr = localStorage.getItem('local_leave_requests');
        const localRequests = localStr ? JSON.parse(localStr) : [];
        const mappedRecords = localRequests.map((record: any) => ({
          requestId: record.id || record.requestId || '',
          employeeId: record.employeeId || '',
          employeeName: record.employeeName || 'Unknown',
          department: record.department || 'General',
          leaveTypeName: record.leaveTypeName || 'Leave',
          startDate: record.startDate || '',
          endDate: record.endDate || '',
          days: record.numberOfDays ?? record.duration ?? record.days ?? 0,
          reason: record.reason || '',
          appliedOn: record.createdAt || '',
          status: record.status || 'Pending',
        }));
        this.allRecords.set(mappedRecords as HrLeaveRecord[]);
      },
    });
  }

  loadDepartments(): void {
    this.hrService.getDepartments().subscribe({
      next: (res: any) => {
        let deptList: any[] = [];

        if (Array.isArray(res)) {
          deptList = res;
        } else if (Array.isArray(res?.data)) {
          deptList = res.data;
        } else if (Array.isArray(res?.departments)) {
          deptList = res.departments;
        }
        const names: string[] = deptList
          .map((d: any) => (typeof d === 'string' ? d : d.name || d.departmentName || ''))
          .filter(Boolean);
        this.departments = ['ALL', ...Array.from(new Set(names))];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching departments:', err);
      },
    });
  }

  loadLeaveTypes(): void {
    this.hrService.getLeaveTypes().subscribe({
      next: (res: any) => {
        let leaveTypeList: any[] = [];

        if (Array.isArray(res)) {
          leaveTypeList = res;
        } else if (Array.isArray(res?.data)) {
          leaveTypeList = res.data;
        } else if (Array.isArray(res?.leaveTypes)) {
          leaveTypeList = res.leaveTypes;
        } else if (Array.isArray(res?.leaveTypeName)) {
          leaveTypeList = res.leaveTypeName;
        } else if (res?.data && typeof res.data === 'object') {
          for (const key of Object.keys(res.data)) {
            if (Array.isArray(res.data[key])) {
              leaveTypeList = res.data[key];
              break;
            }
          }
        }
        const names: string[] = leaveTypeList
          .map((d: any) => (typeof d === 'string' ? d : d.name || d.leaveTypeName || d.type || ''))
          .filter(Boolean);
        this.leaveTypes = ['ALL', ...Array.from(new Set(names))];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching leavetypes:', err);
      },
    });
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }

  onFilterChange(): void {
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
    const id = record.requestId || (record as any).id;
    if (!id) {
      this.selectedRecord.set(record);
      return;
    }

    this.hrService.getRequestById(id).subscribe({
      next: (res: any) => {
        console.log('getLeaveRequestById response:', res);
        const payload = res?.data ?? res;
        const single = Array.isArray(payload) ? payload[0] : payload;
        const mapped = this.mapSingleRecord(single || record);
        this.selectedRecord.set(mapped);
      },
      error: (err: any) => {
        const errorMsg = err?.error?.message || 'Failed to fetch leave request by id.';
        this.toastr.error(errorMsg, 'Update Failed');
        this.selectedRecord.set(record);
      },
    });
  }

  private mapSingleRecord(record: any): HrLeaveRecord {
    return {
      requestId: record.id || record.requestId || '',
      employeeId: record.employeeId || record.employee?.id || record.employeeId || '',
      employeeName:
        record.employeeName || record.employee?.name || record.employeeName || 'Unknown',
      department: record.department || record.employee?.department || 'Unknown',
      leaveTypeName: record.leaveTypeName || 'Unknown',
      startDate: record.startDate || record.createdAt || '',
      endDate: record.endDate || '',
      days: record.numberOfDays ?? record.days ?? 0,
      reason: record.reason || '',
      appliedOn: record.createdAt || record.appliedOn || '',
      status: record.status || 'Pending',
      approverName: record.managerComments ? 'Manager' : record.approverName || undefined,
      approverRemarks: record.managerComments || record.approverRemarks || undefined,
      contactDetails: record.employee?.email || record.contactDetails || undefined,
    } as HrLeaveRecord;
  }

  closeDetailsModal(): void {
    this.selectedRecord.set(null);
  }

  approveRequest(record: HrLeaveRecord): void {
    const id = record.requestId || (record as any).id;
    if (!id) return;
    this.processing.add(id);
    this.hrService.approveLeaveRequest(id).subscribe({
      next: (res: any) => {
        console.log('approveLeaveRequest response:', res);
        // fetch updated record from server
        this.hrService.getRequestById(id).subscribe({
          next: (r: any) => {
            const payload = r?.data ?? r;
            const single = Array.isArray(payload) ? payload[0] : payload;
            const mapped = this.mapSingleRecord(single || record);
            this.replaceRecord(mapped);
            this.selectedRecord.set(mapped);
            this.processing.delete(id);
          },
          error: (err: any) => {
            const errorMsg = err?.error?.message || 'Failed fetching updated record after approve.';
            this.toastr.error(errorMsg, 'Update Failed');
            this.replaceRecord({ ...record, status: 'Approved' });
            this.selectedRecord.set({ ...record, status: 'Approved' });
            this.processing.delete(id);
          },
        });
      },
      error: (err: any) => {
        const errorMsg = err?.error?.message || 'Failed to approve request.';
        this.toastr.error(errorMsg, 'Update Failed');
        this.processing.delete(id);
      },
    });
  }

  rejectRequest(record: HrLeaveRecord): void {
    const id = record.requestId || (record as any).id;
    if (!id) return;
    this.processing.add(id);
    this.hrService.rejectLeaveRequest(id).subscribe({
      next: (res: any) => {
        console.log('rejectLeaveRequest response:', res);
        this.hrService.getRequestById(id).subscribe({
          next: (r: any) => {
            const payload = r?.data ?? r;
            const single = Array.isArray(payload) ? payload[0] : payload;
            const mapped = this.mapSingleRecord(single || record);
            this.replaceRecord(mapped);
            this.selectedRecord.set(mapped);
            this.processing.delete(id);
          },
          error: (err: any) => {
            const errorMsg = err?.error?.message || 'Failed to update record after reject';
            this.toastr.error(errorMsg, 'Update Failed');
            this.replaceRecord({ ...record, status: 'Rejected' });
            this.selectedRecord.set({ ...record, status: 'Rejected' });
            this.processing.delete(id);
          },
        });
      },
      error: (err: any) => {
        const errorMsg = err?.error?.message || 'Failed to reject request.';
        this.toastr.error(errorMsg, 'Update Failed');
        this.processing.delete(id);
      },
    });
  }

  private replaceRecord(updated: HrLeaveRecord): void {
    const list = this.allRecords().map((r) => (r.requestId === updated.requestId ? updated : r));
    this.allRecords.set(list);
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
