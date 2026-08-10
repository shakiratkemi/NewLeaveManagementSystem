import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '../../core/services/auth-service';

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

    private authService: AuthService,
  ) {}

  ngOnInit(): void {
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
    if (this.LoginForm.invalid) {
      this.submitted = true;
      return;
    } else {
      this.authService.login(this.LoginForm.value).subscribe({
        next: (res: any) => {
          console.log('API Response:', res);
          if (res && res.data) {
            const responseData = res.data;
            localStorage.setItem('access_token', responseData.token);
            localStorage.setItem('refresh_token', responseData.refreshToken);
            alert('Login successful');
            const helper = new JwtHelperService();
            const decodedToken = helper.decodeToken(localStorage.getItem('access_token')!);
            this.loggedInUser = {
              ...decodedToken,
              ...responseData,
              fullName:
                responseData.fullName || decodedToken.fullName || decodedToken.name || 'User',
            };
            console.log('Decoded token:', this.loggedInUser);
            localStorage.setItem('loggedInUser', JSON.stringify(this.loggedInUser));

            if (this.loggedInUser.role === 'Manager') {
              this.router.navigateByUrl('/hr');
            } else if (this.loggedInUser.role === 'Employee') {
              this.router.navigateByUrl('/employee');
            } else {
              localStorage.removeItem('access_token');
              alert('Invalid details, please select the right login type');
              this.router.navigateByUrl('/');
            }
          }
        },
        error: () => {
          alert('Login failed. Please check your credentials.');
        },
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
