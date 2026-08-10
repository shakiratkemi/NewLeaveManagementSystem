import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface EmployeeFormPayload {
  fullName: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  role: string;
}

@Component({
  selector: 'app-add-employee',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-employee.html',
  styles: ``,
})
export class AddEmployee {
  @Input() isOpen = false;
  @Input() departments: readonly string[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<EmployeeFormPayload>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      department: ['Engineering', Validators.required],
      designation: ['', Validators.required],
      role: ['Employee', Validators.required],
    });
  }

  onClose(): void {
    this.form.reset({
      fullName: '',
      email: '',
      password: '',
      department: 'Engineering',
      designation: '',
      role: 'Employee',
    });
    this.close.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.form.value as EmployeeFormPayload);
    this.onClose();
  }
}
