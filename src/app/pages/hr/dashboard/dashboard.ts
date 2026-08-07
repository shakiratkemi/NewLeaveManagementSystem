import { Component, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HrService } from '../../../core/services/data/hr/hr-service';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule],
  templateUrl: './dashboard.html',
  styles: ``,
})
export class Dashboard implements OnInit {
  dashboardData!: any;
  leaveRequests = signal<any[]>([]);
  pendingRequests = computed(() =>
    this.leaveRequests().filter((r) => (r as any).status === 'Pending'),
  );
  searchQuery = signal<string>('');
  selectedStatusFilter = signal<string>('All');
  selectedDepartmentFilter = signal<string>('All');
  departments: string[] = ['All', 'Engineering', 'Product', 'Human Resources', 'Sales'];
  statuses: string[] = ['All', 'Pending', 'Approved', 'Rejected'];
  isMobileMenuOpen = false;

  constructor(
    private hrService: HrService,
    private cdr: ChangeDetectorRef,
  ) {}

  // filteredRequests = computed(() => {
  //   return this.leaveRequests().filter((req) => {
  //     const matchesSearch =
  //       req.employeeName.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
  //       req.department.toLowerCase().includes(this.searchQuery().toLowerCase());
  //     const matchesStatus =
  //       this.selectedStatusFilter() === 'All' || req.status === this.selectedStatusFilter();
  //     const matchesDept =
  //       this.selectedDepartmentFilter() === 'All' ||
  //       req.department === this.selectedDepartmentFilter();

  //     return matchesSearch && matchesStatus && matchesDept;
  //   });
  // });

  ngOnInit(): void {
    this.loadDashboard();
    // Subscribe to updates from HrService so dashboard reflects approve/reject actions
    this.hrService.leaveRequestUpdated.subscribe(({ id, status }) => {
      const updated = this.leaveRequests().map((r) =>
        (r as any).id === id || (r as any).requestId === id ? { ...(r as any), status } : r,
      );
      this.leaveRequests.set(updated as any);

      this.loadDashboard();
    });
  }

  updateStatus(id: string, newStatus: 'Approved' | 'Rejected'): void {
    if (!id) return;
    const call =
      newStatus === 'Approved'
        ? this.hrService.approveLeaveRequest(id)
        : this.hrService.rejectLeaveRequest(id);
    call.subscribe({
      next: (res: any) => {
        console.log('Dashboard updateStatus response:', res);
        // hrService will emit leaveRequestUpdated and loadDashboard will handle UI update
      },
      error: (err: any) => {
        console.error('Error updating status from dashboard:', err);
      },
    });
  }
  loadDashboard(): void {
    this.hrService.getHrDashboard().subscribe({
      next: (response: any) => {
        console.log('HR Dashboard response:', response);
        this.dashboardData = response || {};
        this.leaveRequests.set(response?.leaveRequests || []);
        this.cdr.detectChanges();
        // Also fetch full leave requests list (separate endpoint) to ensure table data is available
        this.hrService.getAllLeaveRequests().subscribe({
          next: (lr: any) => {
            console.log('getAllLeaveRequests response:', lr);
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

            if (!Array.isArray(list)) list = [];

            const mapped = list.map((item: any) => ({
              id: item.id ?? item.requestId ?? '',
              requestId: item.id ?? item.requestId ?? '',
              employeeName: item.employeeName ?? item.employee?.name ?? item.name ?? '',
              department: item.department ?? item.employee?.department ?? '',
              leaveType: item.leaveType ?? item.type ?? 'Unknown',
              startDate: item.startDate ?? item.createdAt ?? '',
              endDate: item.endDate ?? '',
              days: item.numberOfDays ?? item.days ?? 0,
              reason: item.reason ?? '',
              status: (item.status || item.state || 'Pending'),
            }));

            console.log('getAllLeaveRequests mapped:', mapped);
            this.leaveRequests.set(mapped || []);
            this.cdr.detectChanges();
          },
          error: (err: any) => console.error('Error loading all leave requests:', err),
        });
      },
      error: (error: any) => {
        console.error('HR Dashboard API error:', error);
      },
    });
  }

  slicedPendingRequests = computed(() => {
    return this.pendingRequests().slice(0, 5);
  });


  
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

  // toggleMobileMenu(): void {
  //   this.isMobileMenuOpen.update((v) => !v);
  // }
}

// updateStatus(id: string, newStatus: 'Approved' | 'Rejected'): void {
//   this.leaveRequests.update((requests) =>
//     requests.map((req) => (req.id === id ? { ...req, status: newStatus } : req)),
//   );
// }

// getStatusClass(status: string): string {
//   switch (status) {
//     case 'Pending':
//       return 'bg-amber-50 text-amber-700 ring-amber-600/20';
//     case 'Approved':
//       return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
//     case 'Rejected':
//       return 'bg-rose-50 text-rose-700 ring-rose-600/20';
//     default:
//       return 'bg-slate-50 text-slate-700 ring-slate-600/20';
//   }
// }
