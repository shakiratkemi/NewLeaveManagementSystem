import { Component } from '@angular/core';
import { LeaveItem } from '../../../core/interface/leave';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-employee-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './employee-sidebar.html',
  styles: ``,
})
export class EmployeeSidebar {
  userName: string = 'Jane Doe';
  userRole: string = 'Software Engineer';
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
}
