import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
export interface LeaveRequest {
  id: string;
  employeeName: string;
  avatar: string;
  department: string;
  leaveType: 'Annual' | 'Sick' | 'Maternity' | 'Casual' | 'Unpaid';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
}

export interface MetricCard {
  title: string;
  value: number;
  change: string;
  isPositive: boolean;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule],
  templateUrl: './dashboard.html',
  styles: ``,
})
export class Dashboard implements OnInit {
  leaveRequests = signal<LeaveRequest[]>([]);
  searchQuery = signal<string>('');
  selectedStatusFilter = signal<string>('All');
  selectedDepartmentFilter = signal<string>('All');
  isMobileMenuOpen = signal<boolean>(false);

  filteredRequests = computed(() => {
    return this.leaveRequests().filter((req) => {
      const matchesSearch =
        req.employeeName.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
        req.department.toLowerCase().includes(this.searchQuery().toLowerCase());
      const matchesStatus =
        this.selectedStatusFilter() === 'All' || req.status === this.selectedStatusFilter();
      const matchesDept =
        this.selectedDepartmentFilter() === 'All' ||
        req.department === this.selectedDepartmentFilter();

      return matchesSearch && matchesStatus && matchesDept;
    });
  });

  metrics = computed<MetricCard[]>(() => {
    const all = this.leaveRequests();
    const pending = all.filter((r) => r.status === 'Pending').length;
    const approved = all.filter((r) => r.status === 'Approved').length;

    return [
      {
        title: 'Pending Approvals',
        value: pending,
        change: '+12% from last week',
        isPositive: false,
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      {
        title: 'Employees On Leave Today',
        value: approved,
        change: '-2% from yesterday',
        isPositive: true,
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      },
      {
        title: 'Approved This Month',
        value: approved,
        change: '+8% from last month',
        isPositive: true,
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      {
        title: 'Total Applications',
        value: all.length,
        change: '+5% total growth',
        isPositive: true,
        icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      },
    ];
  });

  readonly departments = ['All', 'Engineering', 'Human Resources', 'Marketing', 'Product', 'Sales'];
  readonly statuses = ['All', 'Pending', 'Approved', 'Rejected'];

  ngOnInit(): void {
    this.loadMockData();
  }

  updateStatus(id: string, newStatus: 'Approved' | 'Rejected'): void {
    this.leaveRequests.update((requests) =>
      requests.map((req) => (req.id === id ? { ...req, status: newStatus } : req)),
    );
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
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

  private loadMockData(): void {
    this.leaveRequests.set([
      {
        id: 'LV-1001',
        employeeName: 'Sarah Jenkins',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        department: 'Engineering',
        leaveType: 'Annual',
        startDate: '2026-08-10',
        endDate: '2026-08-17',
        days: 5,
        reason: 'Family vacation trip.',
        status: 'Pending',
        appliedOn: '2026-08-01',
      },
      {
        id: 'LV-1002',
        employeeName: 'Marcus Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        department: 'Product',
        leaveType: 'Sick',
        startDate: '2026-08-04',
        endDate: '2026-08-05',
        days: 2,
        reason: 'Medical checkup and rest.',
        status: 'Pending',
        appliedOn: '2026-08-02',
      },
      {
        id: 'LV-1003',
        employeeName: 'Amara Okonjo',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        department: 'Marketing',
        leaveType: 'Casual',
        startDate: '2026-08-15',
        endDate: '2026-08-16',
        days: 1,
        reason: 'Personal errands.',
        status: 'Approved',
        appliedOn: '2026-07-28',
      },
      {
        id: 'LV-1004',
        employeeName: 'David Miller',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        department: 'Engineering',
        leaveType: 'Unpaid',
        startDate: '2026-08-20',
        endDate: '2026-08-25',
        days: 4,
        reason: 'Personal travel.',
        status: 'Rejected',
        appliedOn: '2026-07-25',
      },
    ]);
  }
}
