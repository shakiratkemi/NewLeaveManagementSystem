import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadChildren: () => import('./auth/auth.route').then((m) => m.AUTH_ROUTE) },
  {
    path: 'hr',
    loadChildren: () => import('./pages/hr/hr.route').then((m) => m.HR_ROUTE),
  },
  {
    path: 'employee',
    loadChildren: () => import('./pages/employee/employee.route').then((m) => m.EMPLOYEE_ROUTE),
  },

  { path: 'login', redirectTo: '', pathMatch: 'full' },
];
