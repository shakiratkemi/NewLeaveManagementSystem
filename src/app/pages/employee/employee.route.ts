import { Route } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { LeaveHistory } from './leave-history/leave-history';
import { Profile } from './profile/profile';
import { EmployeeContainer } from './employee-container/employee-container';

export const EMPLOYEE_ROUTE: Route[] = [
  {
    path: '',
    component: EmployeeContainer,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      { path: 'dashboard', component: Dashboard },
      { path: 'leave-history', component: LeaveHistory },
      { path: 'profile', component: Profile },
    ],
  },
];
