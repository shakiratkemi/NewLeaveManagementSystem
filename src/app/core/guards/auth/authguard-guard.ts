import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({ providedIn: 'root' })
export class AuthguardGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');

    if (token) {
      return true;
    } else {
      alert('You are not authorized to access this page. Please log in.');
    }

    return this.router.createUrlTree(['/']);
  }
}
