import { Routes } from '@angular/router';
import { AuthguardGuard } from './core/guards/auth/authguard-guard';

export const routes: Routes = [
  { path: '', loadChildren: () => import('./auth/auth.route').then((m) => m.AUTH_ROUTE) },
  {
    path: 'hr',
    loadChildren: () => import('./pages/hr/hr.route').then((m) => m.HR_ROUTE),
    canActivate: [AuthguardGuard],
  },
  {
    path: 'employee',
    loadChildren: () => import('./pages/employee/employee.route').then((m) => m.EMPLOYEE_ROUTE),
    canActivate: [AuthguardGuard],
  },

  { path: 'login', redirectTo: '', pathMatch: 'full' },
];
