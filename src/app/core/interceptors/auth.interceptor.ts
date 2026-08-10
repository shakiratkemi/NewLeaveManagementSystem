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
    const token = localStorage.getItem('access_token');

    if (!token) {
      return next.handle(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          const refreshToken = localStorage.getItem('refresh_token');

          if (!refreshToken) {
            this.logout();
            return throwError(() => error);
          }

          return this.authService.refreshToken(refreshToken).pipe(
            switchMap((response: any) => {
              const newToken = response.data.token;
              const newRefreshToken = response.data.refreshToken;

              localStorage.setItem('access_token', newToken);

              localStorage.setItem('refresh_token', newRefreshToken);

              // Retry the original request
              const retryRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });

              return next.handle(retryRequest);
            }),

            catchError((refreshError) => {
              // Refresh token is also invalid/expired
              this.logout();

              return throwError(() => refreshError);
            }),
          );
        }

        // For other errors, don't refresh.
        return throwError(() => error);
      }),
    );
  }

  private logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('loggedInUser');

    this.router.navigateByUrl('/');
  }
}
