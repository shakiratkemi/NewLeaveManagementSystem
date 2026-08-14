import { Route } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { LeaveRequest } from './leave-request/leave-request';
import { HrContainer } from './hr-container/hr-container';
import { Employees } from './employees/employees';
import { SettingsPage } from './settings-page/settings-page';

export const HR_ROUTE: Route[] = [
  {
    path: '',
    component: HrContainer,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      { path: 'dashboard', component: Dashboard },
      { path: 'leave-request', component: LeaveRequest },
      { path: 'employees', component: Employees },
      { path: 'settings', component: SettingsPage },
    ],
  },
];
