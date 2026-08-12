import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../evironments/environment';
import { Observable } from 'rxjs';

const routes = {
  login: 'Auth/login',
  registerEmployee: 'Users/provision',
  resetPassword: 'Auth/reset-password',
  getResetToken: 'Users/provision',
  getRefreshToken: 'Auth/refresh-token',
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

  createEmployee(AddEmployeeForm: any) {
    const url = `${this.baseUrl + routes.registerEmployee}`;
    console.log('AuthService.createEmployee request', url, AddEmployeeForm);
    return this.http.post(url, AddEmployeeForm);
  }

  getResetToken(payload: any) {
    const url = `${this.baseUrl + routes.getResetToken}`;
    return this.http.post(url, payload);
  }

  getRefreshToken(refreshToken: string): Observable<any> {
    const url = `${this.baseUrl + routes.getRefreshToken}`;
    return this.http.post(url, { refreshToken });
  }

  resetPassword(payload: any) {
    const url = `${this.baseUrl + routes.resetPassword}`;
    return this.http.post(url, payload);
  }
}
