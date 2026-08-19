import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');

    // Skip attaching token for auth endpoints
    if (req.url.includes('Auth/login') || req.url.includes('Auth/refresh-token')) {
      return next.handle(req);
    }

    const authReq = token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          const refreshToken =
            sessionStorage.getItem('refresh_token') || localStorage.getItem('refresh_token');

          if (!refreshToken) {
            this.logout();
            return throwError(() => error);
          }

          return this.authService.getRefreshToken(refreshToken).pipe(
            switchMap((response: any) => {
              if (!response?.success || !response?.data?.token) {
                this.logout();
                return throwError(
                  () => new Error(response?.message || 'Invalid or expired refresh token.'),
                );
              }

              const newToken = response.data.token;
              const newRefreshToken = response.data.refreshToken || refreshToken;

              sessionStorage.setItem('access_token', newToken);
              sessionStorage.setItem('refresh_token', newRefreshToken);
              localStorage.setItem('access_token', newToken);
              localStorage.setItem('refresh_token', newRefreshToken);

              const retryRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });

              return next.handle(retryRequest);
            }),
            catchError((refreshError) => {
              this.logout();
              return throwError(() => refreshError);
            }),
          );
        }

        if (
          error.status === 400 &&
          error.error?.message?.toLowerCase().includes('refresh token')
        ) {
          this.logout();
        }

        return throwError(() => error);
      }),
    );
  }

  private logout(): void {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('loggedInUser');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('loggedInUser');
    this.router.navigateByUrl('/');
  }
}
