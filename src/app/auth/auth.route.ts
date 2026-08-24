import { Route } from '@angular/router';
import { Login } from './login/login';
import { ResetPassword } from './reset-password/reset-password';

export const AUTH_ROUTE: Route[] = [
  { path: '', component: Login },
  // { path: 'reset-password', component: ResetPassword },
  { path: 'reset-token', component: ResetPassword },
];
