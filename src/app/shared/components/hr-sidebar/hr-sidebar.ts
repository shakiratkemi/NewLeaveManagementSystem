import { Component } from '@angular/core';
import { LeaveItem } from '../../../core/interface/leave';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HrService } from '../../../core/services/data/hr/hr-service';

import { Employee } from '../../../core/services/data/employee/employee';

@Component({
  selector: 'app-hr-sidebar',
  imports: [MatIconModule, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './hr-sidebar.html',
  styles: ``,
})
export class HrSidebar {
  constructor(private router: Router) {}
  data!: any;
  isMobileOpen: boolean = false;
  isCollapsed: boolean = false;
  menus: LeaveItem[] = [
    {
      name: 'Dashboard',
      icon: 'assets/images/apps.svg',
      link: '/hr/dashboard',
    },
    {
      name: 'Leave Requests',
      icon: 'assets/images/calendar.svg',
      link: '/hr/leave-request',
    },

    {
      name: 'Employees',
      icon: 'assets/images/user.svg',
      link: '/hr/employees',
    },
    {
      name: 'Settings',
      icon: 'assets/images/settings.svg',
      link: '/hr/settings',
    },
  ];

  ngOnInit(): void {
    const userData = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
    if (userData) {
      this.data = JSON.parse(userData);
    }
  }

  get userName(): string {
    return this.data?.fullName || this.data?.name || this.data?.employeeName || 'Jane Doe';
  }

  get userRole(): string {
    return this.data?.designation || 'Software Engineer';
  }

  get portalTitle(): string {
    const role = (this.data?.role || '').toLowerCase();
    if (role.includes('teamlead') || role.includes('team_lead') || role.includes('team lead')) {
      return 'Team Lead Portal';
    }
    if (role.includes('employee')) {
      return 'Employee Portal';
    }
    return 'HR Portal';
  }
  get userEmail(): string {
    return this.data?.email || '';
  }

  get userInitials(): string {
    const fullName = this.data?.fullName || this.data?.name || this.data?.employeeName;
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
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('loggedInUser');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('loggedInUser');
    this.router.navigateByUrl('/');
  }
}
