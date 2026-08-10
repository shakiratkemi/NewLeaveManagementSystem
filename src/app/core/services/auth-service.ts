import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../evironments/environment';

const routes = {
  login: 'Auth/login',
  registerEmployee: 'Auth/register',
  resetPassword: 'Auth/reset-password',
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl: string = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(LoginForm: any) {
    const url = `${this.baseUrl + routes.login}`;
    return this.http.post(url, LoginForm);
  }

  registerEmployee(registerForm: any) {
    const url = `${this.baseUrl + routes.registerEmployee}`;
    return this.http.post(url, registerForm);
  }

  resetPassword(payload: any) {
    const url = `${this.baseUrl + routes.resetPassword}`;
    return this.http.post(url, payload);
  }
}
