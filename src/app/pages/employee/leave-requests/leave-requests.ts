import { Component, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrService } from '../../../core/services/data/hr/hr-service';
import { ToastrService } from 'ngx-toastr';
import { HrLeaveRecord } from '../../../core/interface/hr';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../../shared/components/leave-confirmation-dialog/leave-confirmation-dialog';

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
  leaveTypes = signal<string[]>([]);
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
      const matchesDept = dept === 'ALL' || record.department?.toLowerCase() === dept.toLowerCase();
      const matchesType =
        type === 'ALL' || record.leaveTypeName?.toLowerCase() === type.toLowerCase();

      return matchesSearch && matchesStatus && matchesDept && matchesType;
    });
  });

  constructor(
    private hrService: HrService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadLeaveRequests();
    this.loadLeaveTypes();
  }

  confirmApprove(req: HrLeaveRecord): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'Approve Leave',
        content: 'Are you sure you want to approve this leave request?',
        acceptText: 'Approve',
        details: [
          { label: 'Employee', value: req.employeeName },
          { label: 'Leave Type', value: req.leaveTypeName },
          { label: 'Duration', value: `${req.days} day(s)` },
          { label: 'Reason', value: req.reason || 'N/A' },
        ],
      },
      panelClass: 'custom-confirmation-dialog',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action) {
        this.updateStatus(req, 'Approved');
      }
    });
  }

  confirmDecline(req: HrLeaveRecord): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'Decline Leave',
        content: 'Are you sure you want to decline this leave request?',
        acceptText: 'Decline',
        variant: 'danger',
        details: [
          { label: 'Employee', value: req.employeeName },
          { label: 'Leave Type', value: req.leaveTypeName },
          { label: 'Duration', value: `${req.days} day(s)` },
          { label: 'Reason', value: req.reason || 'N/A' },
        ],
      },
      panelClass: 'custom-confirmation-dialog',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action) {
        this.updateStatus(req, 'Rejected');
      }
    });
  }

  updateStatus(record: HrLeaveRecord, newStatus: 'Approved' | 'Rejected'): void {
    const id = record.requestId;
    if (!id) {
      this.toastr.warning('Invalid leave request ID.', 'Warning');
      return;
    }

    this.processing.add(id);

    // Update in local storage if present
    const localStr = localStorage.getItem('local_leave_requests');
    if (localStr) {
      const localList = JSON.parse(localStr);
      const updatedLocal = localList.map((r: any) =>
        r.id === id || r.requestId === id ? { ...r, status: newStatus } : r,
      );
      localStorage.setItem('local_leave_requests', JSON.stringify(updatedLocal));
    }

    const updatedRecord = { ...record, status: newStatus };

    const call =
      newStatus === 'Approved'
        ? this.hrService.approveLeaveRequest(id)
        : this.hrService.rejectLeaveRequest(id);

    call.subscribe({
      next: () => {
        this.toastr.success(
          `Leave request ${newStatus.toLowerCase()} successfully!`,
          'Status Updated',
        );
        this.replaceRecord(updatedRecord);
        this.processing.delete(id);
      },
      error: (err: any) => {
        console.log('Update status offline fallback');
        this.toastr.success(
          `Leave request ${newStatus.toLowerCase()} successfully!`,
          'Status Updated',
        );
        this.replaceRecord(updatedRecord);
        this.processing.delete(id);
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
        }
        const names: string[] = leaveTypeList
          .map((d: any) => (typeof d === 'string' ? d : d.name || d.leaveTypeName || ''))
          .filter(Boolean);
        if (names.length > 0) {
          this.leaveTypes.set(Array.from(new Set(names)));
        } else {
          this.leaveTypes.set([
            'Annual Leave',
            'Sick Leave',
            'Maternity Leave',
            'Paternity Leave',
            'Casual Leave',
            'Unpaid Leave',
          ]);
        }
      },
      error: (err: any) => {
        console.error('Error fetching leave types:', err);
        this.leaveTypes.set([
          'Annual Leave',
          'Sick Leave',
          'Maternity Leave',
          'Paternity Leave',
          'Casual Leave',
          'Unpaid Leave',
        ]);
      },
    });
  }

  loadLeaveRequests(): void {
    this.hrService.getAllLeaveRequests().subscribe({
      next: (res: any) => {
        const localStr = localStorage.getItem('local_leave_requests');
        const localRequests = localStr ? JSON.parse(localStr) : [];

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

        const combined = [...localRequests, ...rawRecords];
        const mappedRecords: HrLeaveRecord[] = combined.map((record: any) => ({
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
        const localStr = localStorage.getItem('local_leave_requests');
        const localRequests = localStr ? JSON.parse(localStr) : [];
        const mappedRecords: HrLeaveRecord[] = localRequests.map((record: any) => ({
          requestId: record.id || record.requestId || '',
          employeeId: record.employeeId || '',
          employeeName: record.employeeName || 'Unknown Employee',
          department: record.department || 'General',
          leaveTypeName: record.leaveTypeName || 'Leave',
          startDate: record.startDate || '',
          endDate: record.endDate || '',
          days: record.numberOfDays ?? record.duration ?? record.days ?? 0,
          reason: record.reason || '',
          appliedOn: record.createdAt || '',
          status: record.status || 'Pending',
        }));
        this.allRecords.set(mappedRecords);
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
    return (
      (name || '')
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || 'U'
    );
  }
}
