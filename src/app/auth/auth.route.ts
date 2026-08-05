import { Route } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';

export const AUTH_ROUTE: Route[] = [
  { path: '', component: Login },
  { path: 'register', component: Register },
];
