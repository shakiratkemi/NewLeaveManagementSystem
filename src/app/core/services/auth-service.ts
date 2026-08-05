import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../evironments/environment';

const routes = {
  login: 'Auth/login',
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
    const { email, password } = LoginForm; // destructure the login object
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('email', email)
      .set('password', password);
    return this.http.post(url, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }
}
