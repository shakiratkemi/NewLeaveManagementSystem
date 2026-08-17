import { Component, OnInit } from '@angular/core';
import { LeaveItem } from '../../../core/interface/leave';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Employee } from '../../../core/services/data/employee/employee';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-employee-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './employee-sidebar.html',
  styles: ``,
})
export class EmployeeSidebar implements OnInit {
  profile!: any;

  constructor(
    private router: Router,
    private employeeService: Employee,
  ) {}

  isMobileOpen: boolean = false;
  isCollapsed: boolean = false;
  menus: LeaveItem[] = [
    {
      name: 'Dashboard',
      icon: 'assets/images/apps.svg',
      link: '/employee/dashboard',
    },
    {
      name: 'Leave History',
      icon: 'assets/images/calendar.svg',
      link: '/employee/leave-history',
    },
    {
      name: 'Profile',
      icon: 'assets/images/user.svg',
      link: '/employee/profile',
    },
  ];

  ngOnInit(): void {
    const user = localStorage.getItem('loggedInUser');
    if (user) {
      this.profile = JSON.parse(user);
      this.buildMenus();
      return;
    }

    // Fallback: fetch profile from API if not present in localStorage
    this.employeeService.getProfileDetails().subscribe({
      next: (response: any) => {
        const payload = response?.data ?? response;
        const profileData = payload?.data ?? payload?.profile ?? payload;

        this.profile = {
          ...this.profile,
          ...profileData,
        };
        this.buildMenus();
      },
      error: (err) => {
        console.error('Sidebar profile API error:', err);
      },
    });
  }

  get isTeamLead(): boolean {
    const role = (this.profile?.role || '').toLowerCase();
    return role === 'teamlead' || role === 'team_lead' || role === 'team lead';
  }

  buildMenus(): void {
    const items: LeaveItem[] = [
      {
        name: 'Dashboard',
        icon: 'assets/images/apps.svg',
        link: '/employee/dashboard',
      },
      {
        name: 'Leave History',
        icon: 'assets/images/calendar.svg',
        link: '/employee/leave-history',
      },
    ];

    if (this.isTeamLead) {
      items.push({
        name: 'Leave Requests',
        icon: 'assets/images/todo.svg',
        link: '/employee/leave-requests',
      });
    }

    items.push({
      name: 'Profile',
      icon: 'assets/images/user.svg',
      link: '/employee/profile',
    });

    this.menus = items;
  }

  get fullName(): string {
    return this.profile?.fullName || this.profile?.name || this.profile?.employeeName || '';
  }
  get email(): string {
    return this.profile?.email || this.profile?.designation || '';
  }

  get userInitials(): string {
    const fullName = this.profile?.fullName || this.profile?.name || this.profile?.employeeName;
    if (!fullName) return 'U';

    const names = String(fullName).trim().split(/\s+/);
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  toggleMenu(menu: any) {
    if (this.isCollapsed && menu.children) {
      this.isCollapsed = false;
    }

    if (!menu.children) return;

    this.menus.forEach((m) => {
      if (m !== menu) (m as any).open = false;
    });

    menu.open = !menu.open;
  }

  toggleMobileSidebar() {
    this.isMobileOpen = !this.isMobileOpen;
  }

  toggleDesktopCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  closeMobile() {
    this.isMobileOpen = false;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('loggedInUser');
    this.router.navigateByUrl('/');
  }
}
