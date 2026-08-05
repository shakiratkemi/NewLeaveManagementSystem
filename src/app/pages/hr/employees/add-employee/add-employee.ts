import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee } from '../../../../core/interface/employee';


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
  @Output() save = new EventEmitter<
    Omit<Employee, 'id' | 'avatar' | 'annualLeaveBalance' | 'sickLeaveBalance'>
  >();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      department: ['Engineering', Validators.required],
      totalAnnualLeave: [20, [Validators.required, Validators.min(0)]],
      totalSickLeave: [10, [Validators.required, Validators.min(0)]],
      status: ['Active', Validators.required],
    });
  }

  onClose(): void {
    this.form.reset({
      department: 'Engineering',
      totalAnnualLeave: 20,
      totalSickLeave: 10,
      status: 'Active',
    });
    this.close.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.form.value);
    this.onClose();
  }
}
