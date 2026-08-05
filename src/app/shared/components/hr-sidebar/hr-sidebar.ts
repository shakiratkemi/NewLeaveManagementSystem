import { Component } from '@angular/core';
import { LeaveItem } from '../../../core/interface/leave';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hr-sidebar',
  imports: [MatIconModule, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './hr-sidebar.html',
  styles: ``,
})
export class HrSidebar {
  constructor(private router: Router) {}
  userName: string = 'Jane Doe';
  userRole: string = 'Software Engineer';
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
  ];
  get userInitials(): string {
    if (!this.userName) return 'U';

    const names = this.userName.trim().split(' ');
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
