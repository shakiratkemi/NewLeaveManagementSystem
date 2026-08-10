import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, MatIconModule, CommonModule],
  templateUrl: './register.html',
  styles: ``,
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  showPassword: boolean = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      designation: ['', Validators.required],
      department: ['', Validators.required],
      role: ['', Validators.required],
    });
  }

  register(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.authService.registerEmployee(this.registerForm.value).subscribe({
      next: (response) => {
        console.log('Employee registered successfully:', response);
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Error registering employee:', error);
      },
    });
  }
}
