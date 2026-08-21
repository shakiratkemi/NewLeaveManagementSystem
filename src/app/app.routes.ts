import { Routes } from '@angular/router';
import { AuthguardGuard } from './core/guards/auth/authguard-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing-page/landing/landing').then((m) => m.Landing),
    pathMatch: 'full',
  },
  {
    path: 'landing',
    loadComponent: () => import('./pages/landing-page/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'login',
    loadChildren: () => import('./auth/auth.route').then((m) => m.AUTH_ROUTE),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.route').then((m) => m.AUTH_ROUTE),
  },
  {
    path: 'reset-token',
    loadComponent: () => import('./auth/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./auth/reset-password/reset-password').then((m) => m.ResetPassword),
  },
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
  {
    path: 'onboarding',
    loadComponent: () => import('./pages/hr-onboarding/onboarding/onboarding').then((m) => m.Onboarding),
  },
];
