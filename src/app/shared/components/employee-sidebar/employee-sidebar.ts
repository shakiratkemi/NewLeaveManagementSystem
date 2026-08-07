import { Component, OnInit } from '@angular/core';
import { LeaveItem } from '../../../core/interface/leave';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProfileDetails } from '../../../core/interface/employee';
import { Employee } from '../../../core/services/data/employee/employee';

@Component({
  selector: 'app-employee-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './employee-sidebar.html',
  styles: ``,
})
export class EmployeeSidebar implements OnInit {
  profile!: ProfileDetails;

  constructor(
    private employeeService: Employee,
    private router: Router,
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
    this.loadProfile();
  }

  getFirstTwoCharacters(name: string): string {
    return name.charAt(0) + name.charAt(1);
  }

  loadProfile(): void {
    this.employeeService.getProfileDetails().subscribe({
      next: (response: any) => {
        console.log('Profile response:', response);

        const payload = response?.data ?? response;
        const profileData = payload?.data ?? payload?.profile ?? payload;

        this.profile = {
          ...profileData,
          fullName: profileData?.fullName ?? profileData?.name ?? '',
          leaveBalance: profileData?.leaveBalance ?? profileData?.annualLeaveBalance ?? 0,
          designation: profileData?.designation ?? profileData?.jobTitle ?? '',
          createdAt: profileData?.createdAt ?? profileData?.startDate ?? null,
        } as ProfileDetails;
      },

      error: (error) => {
        console.error('Profile API error:', error);
      },
    });
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
