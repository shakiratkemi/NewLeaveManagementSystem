import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee } from '../../../../core/services/data/employee/employee';
import { LeaveRequest, LeaveTypes } from '../../../../core/interface/employee';
import { Router } from '@angular/router';

@Component({
  selector: 'app-applyleave',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './apply-leave.html',
  styles: ``,
})
export class Applyleave {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  leaveForm!: FormGroup;

  leaveTypes: LeaveTypes[] = [];

  minEndDate = '';

  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private employeeService: Employee,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.leaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      duration: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5)]],
    });

    this.loadLeaveTypes();
  }

  loadLeaveTypes(): void {
    this.employeeService.getLeaveTypes().subscribe({
      next: (response) => {
        this.leaveTypes = response;
        console.log('Leave Types:', this.leaveTypes);
      },
      error: (error) => {
        console.error('Leave Type API error:', error);
      },
    });
  }

  onStartDateChange(): void {
    const startDate = this.leaveForm.get('startDate')?.value;

    this.minEndDate = startDate || '';

    const endDate = this.leaveForm.get('endDate')?.value;

    if (endDate && startDate && endDate < startDate) {
      this.leaveForm.get('endDate')?.setValue('');
    }
  }

  onSubmit(): void {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.leaveForm.value;

    const leaveRequest: LeaveRequest = {
      leaveTypeId: formValue.leaveType,
      startDate: new Date(formValue.startDate).toISOString(),
      endDate: new Date(formValue.endDate).toISOString(),
      reason: formValue.reason,
      requestComments: '',
    };

    console.log('Leave Request Payload:', leaveRequest);

    this.employeeService.createLeaveRequest(leaveRequest).subscribe({
      next: (response) => {
        console.log('Leave request created:', response);

        this.successMessage = 'Leave request submitted successfully.';

        this.router.navigateByUrl('/employee/leave-history');
      },

      error: (error) => {
        console.error('Leave request API error:', error);

        this.errorMessage =
          error?.error?.message || 'Unable to submit leave request. Please try again.';
      },
    });
  }

  onClose(): void {
    this.leaveForm.reset();
    this.close.emit();
  }
}
