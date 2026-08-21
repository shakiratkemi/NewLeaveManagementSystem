import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding {
  onboardingForm: FormGroup;
  isSubmitting = signal(false);
  isDragging = signal(false);

  // Logo state
  logoPreview = signal<string | null>(null);
  logoFile = signal<File | null>(null);

  readonly industries: string[] = [
    'Technology & Software',
    'Financial Services & Banking',
    'Healthcare & Life Sciences',
    'Education & E-Learning',
    'E-commerce & Retail',
    'Manufacturing & Logistics',
    'Professional Services & Consulting',
    'Media & Entertainment',
    'Non-Profit & NGO',
    'Real Estate & Construction',
    'Energy & Utilities',
    'Other',
  ];

  readonly companySizes: string[] = [
    '1 - 10 employees',
    '11 - 50 employees',
    '51 - 200 employees',
    '201 - 500 employees',
    '501 - 1,000 employees',
    '1,000+ employees',
  ];

  readonly timezones: string[] = [
    'UTC (Coordinated Universal Time)',
    'EST (Eastern Standard Time - UTC-5)',
    'CST (Central Standard Time - UTC-6)',
    'PST (Pacific Standard Time - UTC-8)',
    'GMT (Greenwich Mean Time - UTC+0)',
    'WAT (West Africa Time - UTC+1)',
    'CET (Central European Time - UTC+1)',
    'IST (India Standard Time - UTC+5:30)',
    'GST (Gulf Standard Time - UTC+4)',
    'AEST (Australian Eastern Standard Time - UTC+10)',
  ];

  readonly dateFormats: string[] = [
    'MM/DD/YYYY (e.g., 12/31/2024)',
    'DD/MM/YYYY (e.g., 31/12/2024)',
    'YYYY-MM-DD (e.g., 2024-12-31)',
    'DD MMM YYYY (e.g., 31 Dec 2024)',
  ];

  readonly currencies: string[] = [
    'USD ($) - US Dollar',
    'EUR (€) - Euro',
    'GBP (£) - British Pound',
    'NGN (₦) - Nigerian Naira',
    'CAD ($) - Canadian Dollar',
    'AUD ($) - Australian Dollar',
    'INR (₹) - Indian Rupee',
    'AED (د.إ) - UAE Dirham',
    'ZAR (R) - South African Rand',
  ];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
  ) {
    this.onboardingForm = this.fb.group({
      // Company Profile
      companyName: ['', [Validators.required]],
      industry: ['', [Validators.required]],
      companySize: [''],
      website: [''],

      // HR Administrator Setup
      adminFullName: ['', [Validators.required]],
      adminWorkEmail: ['', [Validators.required, Validators.email]],
      adminPhoneNumber: [''],
      adminJobTitle: [''],

      // System Preferences
      employeeIdPrefix: ['NIG-', [Validators.required]],
      timezone: ['UTC (Coordinated Universal Time)', [Validators.required]],
      dateFormat: ['MM/DD/YYYY (e.g., 12/31/2024)', [Validators.required]],
      currency: ['USD ($) - US Dollar', [Validators.required]],
    });
  }

  get sampleEmployeeId(): string {
    const raw = (this.onboardingForm.get('employeeIdPrefix')?.value || 'NIG-').trim();
    if (!raw) return 'NIG-001';
    // If user already included numbers or hyphens
    if (raw.endsWith('-') || raw.endsWith('/') || raw.endsWith('_')) {
      return `${raw}001`;
    }
    return `${raw}-001`;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.handleLogoFile(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.handleLogoFile(file);
    }
  }

  private handleLogoFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.toastr.error('Please upload an image file (SVG, PNG, JPG, or GIF)', 'Invalid File Type');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toastr.error('Image size must be less than 5MB', 'File Too Large');
      return;
    }

    this.logoFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.logoPreview.set(null);
    this.logoFile.set(null);
  }

  onSubmit(): void {
    if (this.onboardingForm.invalid) {
      this.onboardingForm.markAllAsTouched();
      this.toastr.error('Please fill in all required fields.', 'Validation Error');
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      ...this.onboardingForm.value,
      sampleEmployeeIdPreview: this.sampleEmployeeId,
      logoName: this.logoFile()?.name || null,
    };

    console.log('HR Onboarding Submitted:', payload);

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.toastr.success('Workspace setup completed successfully!', 'Setup Complete');
      this.router.navigate(['/hr/dashboard']);
    }, 1000);
  }

  backHome() {
    this.router.navigateByUrl('/');
  }
}
