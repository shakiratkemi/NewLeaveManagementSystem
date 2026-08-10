import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, MatIconModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  ResetPasswordForm!: FormGroup;
  showPassword: boolean = false;
  tokenFromUrl: string = '';
  isSubmitting: boolean = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const emailFromUrl = this.route.snapshot.queryParams['email'] || '';
    this.tokenFromUrl = this.route.snapshot.queryParams['token'] || '';
    this.ResetPasswordForm = this.fb.group({
      email: [emailFromUrl, Validators.compose([Validators.required, Validators.email])],
      token: [this.tokenFromUrl, Validators.required],
      newPassword: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,15}$'),
        ]),
      ],
    });
  }

  resetPassword(): void {
    if (this.ResetPasswordForm.invalid) {
      this.ResetPasswordForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;

    const payload = {
      email: this.ResetPasswordForm.value.email,
      token: this.ResetPasswordForm.value.token,
      newPassword: this.ResetPasswordForm.value.newPassword,
    };

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        alert('Password reset successful');
        this.router.navigateByUrl('/login');
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Reset Password Error:', err);
        alert(err?.error?.message || 'Failed to reset password');
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
