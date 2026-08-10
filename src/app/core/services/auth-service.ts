import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../evironments/environment';
import { Observable } from 'rxjs';

const routes = {
  login: 'Auth/login',
  refresh_token: 'Auth/refresh-token',
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

  //Login
  login(LoginForm: any) {
    const url = `${this.baseUrl + routes.login}`;
    return this.http.post(url, LoginForm);
  }

  //Refresh-token
  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}${routes.refresh_token}`, { refreshToken });
  registerEmployee(registerForm: any) {
    const url = `${this.baseUrl + routes.registerEmployee}`;
    return this.http.post(url, registerForm);
  }

  resetPassword(payload: any) {
    const url = `${this.baseUrl + routes.resetPassword}`;
    return this.http.post(url, payload);
  }
}
