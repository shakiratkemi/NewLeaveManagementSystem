import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrService } from '../../../core/services/data/hr/hr-service';
import { ToastrService } from 'ngx-toastr';
import { HrLeaveRecord } from '../../../core/interface/hr';

@Component({
  selector: 'app-teamlead-leave-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './leave-requests.html',
  styles: ``,
})
export class LeaveRequests implements OnInit {
  allRecords = signal<HrLeaveRecord[]>([]);
  searchTerm = signal<string>('');
  selectedStatusFilter = signal<string>('ALL');
  selectedDepartmentFilter = signal<string>('ALL');
  selectedTypeFilter = signal<string>('ALL');
  selectedRecord = signal<HrLeaveRecord | null>(null);

  // Track processing request IDs to disable buttons during network calls
  processing = new Set<string>();

  filteredRecords = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.selectedStatusFilter();
    const dept = this.selectedDepartmentFilter();
    const type = this.selectedTypeFilter();

    return this.allRecords().filter((record) => {
      const matchesSearch =
        !search ||
        record.employeeName?.toLowerCase().includes(search) ||
        record.employeeId?.toLowerCase().includes(search) ||
        record.requestId?.toLowerCase().includes(search) ||
        record.reason?.toLowerCase().includes(search);

      const matchesStatus =
        status === 'ALL' || record.status?.toLowerCase() === status.toLowerCase();
      const matchesDept =
        dept === 'ALL' || record.department?.toLowerCase() === dept.toLowerCase();
      const matchesType =
        type === 'ALL' || record.leaveTypeName?.toLowerCase() === type.toLowerCase();

      return matchesSearch && matchesStatus && matchesDept && matchesType;
    });
  });

  constructor(
    private hrService: HrService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadLeaveRequests();
  }

  loadLeaveRequests(): void {
    this.hrService.getAllLeaveRequests().subscribe({
      next: (res: any) => {
        let rawRecords: any[] = [];
        if (Array.isArray(res)) rawRecords = res;
        else if (Array.isArray(res?.data)) rawRecords = res.data;
        else if (Array.isArray(res?.leaveRequests)) rawRecords = res.leaveRequests;
        else {
          for (const k of Object.keys(res || {})) {
            if (Array.isArray(res[k])) {
              rawRecords = res[k];
              break;
            }
          }
        }

        const mappedRecords: HrLeaveRecord[] = rawRecords.map((record: any) => ({
          requestId: record.id || record.requestId || '',
          employeeId: record.employeeId || record.employee?.id || '',
          employeeName:
            record.employeeName ||
            record.employee?.fullName ||
            record.employee?.name ||
            record.name ||
            'Unknown Employee',
          department: record.department || record.employee?.department || 'General',
          leaveTypeName: record.leaveTypeName || record.leaveType?.name || record.type || 'Leave',
          startDate: record.startDate || record.createdAt || '',
          endDate: record.endDate || '',
          days: record.numberOfDays ?? record.duration ?? record.days ?? 0,
          reason: record.reason || record.requestComments || '',
          appliedOn: record.createdAt || record.appliedOn || '',
          status: record.status || record.state || 'Pending',
          approverName: record.managerComments ? 'Manager' : undefined,
          approverRemarks: record.managerComments || undefined,
          contactDetails: record.employee?.email || undefined,
        }));

        this.allRecords.set(mappedRecords);
      },
      error: (err: any) => {
        console.error('Error loading leave requests:', err);
      },
    });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatusFilter.set('ALL');
    this.selectedDepartmentFilter.set('ALL');
    this.selectedTypeFilter.set('ALL');
  }

  approveRequest(record: HrLeaveRecord): void {
    const id = record.requestId;
    if (!id) return;
    this.processing.add(id);

    this.hrService.approveLeaveRequest(id).subscribe({
      next: () => {
        this.toastr.success('Leave request approved successfully!', 'Approved');
        this.replaceRecord({ ...record, status: 'Approved' });
        this.processing.delete(id);
      },
      error: (err: any) => {
        console.error('Error approving request:', err);
        const msg = err?.error?.message || 'Failed to approve leave request.';
        this.toastr.error(msg, 'Approval Error');
        this.processing.delete(id);
      },
    });
  }

  rejectRequest(record: HrLeaveRecord): void {
    const id = record.requestId;
    if (!id) return;
    this.processing.add(id);

    this.hrService.rejectLeaveRequest(id).subscribe({
      next: () => {
        this.toastr.success('Leave request rejected successfully!', 'Rejected');
        this.replaceRecord({ ...record, status: 'Rejected' });
        this.processing.delete(id);
      },
      error: (err: any) => {
        console.error('Error rejecting request:', err);
        const msg = err?.error?.message || 'Failed to reject leave request.';
        this.toastr.error(msg, 'Rejection Error');
        this.processing.delete(id);
      },
    });
  }

  private replaceRecord(updated: HrLeaveRecord): void {
    const list = this.allRecords().map((r) => (r.requestId === updated.requestId ? updated : r));
    this.allRecords.set(list);
    if (this.selectedRecord()?.requestId === updated.requestId) {
      this.selectedRecord.set(updated);
    }
  }

  openDetailsModal(record: HrLeaveRecord): void {
    this.selectedRecord.set(record);
  }

  closeDetailsModal(): void {
    this.selectedRecord.set(null);
  }

  getStatusBadgeClass(status: string): string {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'pending':
        return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 ring-rose-600/20';
      default:
        return 'bg-slate-50 text-slate-700 ring-slate-600/20';
    }
  }

  getInitials(name: string): string {
    return (name || '')
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'U';
  }
}
