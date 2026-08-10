import { Route } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { ResetPassword } from './reset-password/reset-password';

export const AUTH_ROUTE: Route[] = [
  { path: '', component: Login },
  { path: 'register', component: Register },
  {path:'reset-password', component: ResetPassword},
];
