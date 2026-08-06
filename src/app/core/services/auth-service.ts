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
    return this.http.post(url, LoginForm);
  }
}
