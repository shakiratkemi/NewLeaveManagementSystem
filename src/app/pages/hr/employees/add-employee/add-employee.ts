import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface EmployeeFormPayload {
  fullName: string;
  email: string;
  department: string;
  designation: string;
  role: string;
  clientResetUrl?: string;
}

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-employee.html',
  styles: ``,
})
export class AddEmployee {
  @Input() isOpen = false;
  @Input() departments: readonly string[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<EmployeeFormPayload>();

  AddEmployeeForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.AddEmployeeForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: ['Engineering', Validators.required],
      designation: ['', Validators.required],
      role: ['Employee', Validators.required],
      clientResetUrl: [`${window.location.origin}/reset-password`, Validators.required],
    });
  }

  onClose(): void {
    this.AddEmployeeForm.reset({
      fullName: '',
      email: '',
      department: 'Engineering',
      designation: '',
      role: 'Employee',
      clientResetUrl: `${window.location.origin}/reset-password`,
    });
    this.close.emit();
  }

  onSubmit(): void {
    if (this.AddEmployeeForm.invalid) {
      this.AddEmployeeForm.markAllAsTouched();
      return;
    }

    const payload = this.AddEmployeeForm.value as EmployeeFormPayload;
    console.log('AddEmployee onSubmit payload:', payload);
    this.save.emit(payload);
  }
}
