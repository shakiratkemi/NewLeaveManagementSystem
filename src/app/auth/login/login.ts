import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '../../core/services/auth-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, CommonModule],
  templateUrl: './login.html',
  styles: ``,
})
export class Login implements OnInit {
  LoginForm!: FormGroup;
  loggedInUser: any;
  showPassword: boolean = false;
  submitted: boolean = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    const email = this.route.snapshot.queryParams['email'];
    if (token || email) {
      this.router.navigate(['/reset-password'], {
        queryParams: this.route.snapshot.queryParams,
        replaceUrl: true,
      });
      return;
    }

    this.LoginForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,15}$'),
        ]),
      ],
    });
  }

  login() {
    this.submitted = true;
    if (this.LoginForm.invalid) {
      this.toastr.warning('Please complete all required fields correctly.', 'Validation Error');
      return;
    } else {
      this.authService.login(this.LoginForm.value).subscribe({
        next: (res: any) => {
          console.log('API Response:', res);
          if (res && res.data) {
            const responseData = res.data;
            sessionStorage.setItem('access_token', responseData.token);
            sessionStorage.setItem('refresh_token', responseData.refreshToken);
            localStorage.setItem('access_token', responseData.token);
            localStorage.setItem('refresh_token', responseData.refreshToken);

            const helper = new JwtHelperService();
            const decodedToken = helper.decodeToken(responseData.token);
            this.loggedInUser = {
              ...decodedToken,
              ...responseData,
              fullName:
                responseData.fullName || decodedToken?.fullName || decodedToken?.name || 'User',
            };
            console.log('Decoded token:', this.loggedInUser);
            sessionStorage.setItem('loggedInUser', JSON.stringify(this.loggedInUser));
            localStorage.setItem('loggedInUser', JSON.stringify(this.loggedInUser));

            if (this.loggedInUser.role === 'HR') {
              this.toastr.success('Login successful! Redirecting to HR dashboard...', 'Success');
              this.router.navigateByUrl('/hr');
            } else if (
              this.loggedInUser.role === 'Employee' ||
              this.loggedInUser.role === 'TeamLead'
            ) {
              this.toastr.success(
                'Login successful! Redirecting to Employee dashboard...',
                'Success',
              );
              this.router.navigateByUrl('/employee');
            } else {
              localStorage.removeItem('access_token');
              this.toastr.warning(
                'Invalid details, please select the right login type.',
                'Access Denied',
              );
              this.router.navigateByUrl('/');
            }
          }
        },
        error: (err) => {
          const errorMessage =
            err?.error?.message || 'Login failed. Please check your credentials.';
          this.toastr.error(errorMessage, 'Authentication Failed');
        },
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onForgotPassword(): void {
    this.router.navigateByUrl('/forgot-password');
  }

  onContactHr(): void {
    this.router.navigateByUrl('/contact-hr');
  }
}