import { Component, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HrService } from '../../../core/services/data/hr/hr-service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../../shared/components/leave-confirmation-dialog/leave-confirmation-dialog';
import { HrLeaveRecord } from '../../../core/interface/hr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink, MatDialogModule],
  templateUrl: './dashboard.html',
  styles: ``,
})
export class Dashboard implements OnInit {
  dashboardData!: any;
  leaveRequests = signal<any[]>([]);
  allRecords = signal<HrLeaveRecord[]>([]);
  pendingRequests = computed(() =>
    this.leaveRequests().filter((r) => (r as any).status === 'Pending'),
  );
  searchQuery = signal<string>('');
  selectedStatusFilter = signal<string>('Pending');
  selectedDepartmentFilter = signal<string>('All');
  departments: string[] = ['All'];
  statuses: string[] = ['All', 'Pending', 'Approved', 'Rejected'];
  isMobileMenuOpen = false;
  selectedRecord = signal<HrLeaveRecord | null>(null);

  filteredRequests = computed(() => {
    return this.leaveRequests().filter((req) => {
      const matchesSearch =
        !this.searchQuery() ||
        (req.employeeName &&
          req.employeeName.toLowerCase().includes(this.searchQuery().toLowerCase())) ||
        (req.department && req.department.toLowerCase().includes(this.searchQuery().toLowerCase()));
      const matchesStatus =
        this.selectedStatusFilter() === 'All' || req.status === this.selectedStatusFilter();
      const matchesDept =
        this.selectedDepartmentFilter() === 'All' ||
        req.department === this.selectedDepartmentFilter();

      return matchesSearch && matchesStatus && matchesDept;
    });
  });

  slicedPendingRequests = computed(() => {
    return this.pendingRequests().slice(0, 5);
  });

  constructor(
    private hrService: HrService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {}

  processing = new Set<string>();

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
        this.approveRequest(req);
      }
    });
  }

  confirmDecline(req: any): void {
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
        this.rejectRequest(req);
      }
    });
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadDepartments();
    // Subscribe to updates from HrService so dashboard reflects approve/reject actions
    this.hrService.leaveRequestUpdated.subscribe(({ id, status }) => {
      const updated = this.leaveRequests().map((r) =>
        (r as any).id === id || (r as any).requestId === id ? { ...(r as any), status } : r,
      );
      this.leaveRequests.set(updated as any);

      this.loadDashboard();
    });
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
        this.departments = ['All', ...Array.from(new Set(names))];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching departments:', err);
      },
    });
  }

  loadDashboard(): void {
    this.hrService.getHrDashboard().subscribe({
      next: (response: any) => {
        console.log('HR Dashboard response:', response);
        const data = response?.data || response || {};

        this.hrService.getAllLeaveRequests().subscribe({
          next: (lr: any) => {
            console.log('getAllLeaveRequests response:', lr);
            const localStr = localStorage.getItem('local_leave_requests');
            const localRequests = localStr ? JSON.parse(localStr) : [];

            let list: any[] = [];
            if (Array.isArray(lr)) list = lr;
            else if (Array.isArray(lr?.data)) list = lr.data;
            else if (Array.isArray(lr?.leaveRequests)) list = lr.leaveRequests;
            else {
              for (const k of Object.keys(lr || {})) {
                if (Array.isArray(lr[k])) {
                  list = lr[k];
                  break;
                }
              }
            }

            const combinedList = [...localRequests, ...list];

            const mapped = combinedList.map((item: any) => ({
              id: item.id ?? item.requestId ?? '',
              requestId: item.id ?? item.requestId ?? '',
              employeeName:
                item.employeeName ??
                item.employee?.fullName ??
                item.employee?.name ??
                item.name ??
                'Employee',
              department: item.department ?? item.employee?.department ?? 'Engineering',
              leaveTypeName: item.leaveTypeName ?? item.leaveType?.name ?? item.type ?? 'Leave',
              startDate: item.startDate ?? item.createdAt ?? '',
              endDate: item.endDate ?? '',
              days: item.numberOfDays ?? item.duration ?? item.days ?? 0,
              reason: item.reason ?? '',
              status: item.status || item.state || 'Pending',
            }));

            console.log('getAllLeaveRequests mapped:', mapped);
            this.leaveRequests.set(mapped || []);

            const pendingCount = mapped.filter((r) => r.status === 'Pending').length;
            const approvedCount = mapped.filter((r) => r.status === 'Approved').length;
            const rejectedCount = mapped.filter((r) => r.status === 'Rejected').length;

            this.dashboardData = {
              totalEmployees: data.totalEmployees ?? 3,
              pendingApprovalsCount: Math.max(data.pendingApprovalsCount || 0, pendingCount),
              approvedRequestsCount: Math.max(data.approvedRequestsCount || 0, approvedCount),
              totalRequestsCount: Math.max(data.totalRequestsCount || 0, mapped.length),
              employeesCurrentlyOnLeave: data.employeesCurrentlyOnLeave || 0,
              rejectedRequestsCount: Math.max(data.rejectedRequestsCount || 0, rejectedCount),
            };

            this.cdr.detectChanges();
          },
          error: (err: any) => {
            console.error('Error loading all leave requests:', err);
            const localStr = localStorage.getItem('local_leave_requests');
            const localRequests = localStr ? JSON.parse(localStr) : [];
            const mapped = localRequests.map((item: any) => ({
              id: item.id ?? item.requestId ?? '',
              requestId: item.id ?? item.requestId ?? '',
              employeeName: item.employeeName ?? 'Employee',
              department: item.department ?? 'Engineering',
              leaveTypeName: item.leaveTypeName ?? 'Leave',
              startDate: item.startDate ?? '',
              endDate: item.endDate ?? '',
              days: item.numberOfDays ?? item.days ?? 0,
              reason: item.reason ?? '',
              status: item.status || 'Pending',
            }));

            this.leaveRequests.set(mapped);
            const pendingCount = mapped.filter((r: any) => r.status === 'Pending').length;

            this.dashboardData = {
              totalEmployees: data.totalEmployees ?? 3,
              pendingApprovalsCount: Math.max(data.pendingApprovalsCount || 0, pendingCount),
              approvedRequestsCount: data.approvedRequestsCount || 0,
              totalRequestsCount: Math.max(data.totalRequestsCount || 0, mapped.length),
              employeesCurrentlyOnLeave: 0,
              rejectedRequestsCount: 0,
            };

            this.cdr.detectChanges();
          },
        });
      },
      error: (error: any) => {
        console.error('HR Dashboard API error:', error);
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

  private replaceRecord(updated: HrLeaveRecord): void {
    const list = this.allRecords().map((r) => (r.requestId === updated.requestId ? updated : r));
    this.allRecords.set(list);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 ring-rose-600/20';
      default:
        return 'bg-slate-50 text-slate-700 ring-slate-600/20';
    }
  }
}
