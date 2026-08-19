import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeFormPayload } from '../../../../core/interface/hr';
import { ToastrService } from 'ngx-toastr';

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

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {
    this.AddEmployeeForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: ['Engineering', Validators.required],
      designation: ['', Validators.required],
      role: ['Employee', Validators.required],
      clientResetUrl: [`${window.location.origin}/auth/reset-password`, Validators.required],
    });
  }

  importCSV(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      this.toastr.warning('Please select a CSV file..', 'CSV file');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const csvText = reader.result as string;

      console.log('CSV content:', csvText);

      this.parseCSV(csvText);
    };
    reader.onerror = () => {
      this.toastr.error('Unable to read the CSV file..', 'Error');
    };

    reader.readAsText(file);

    input.value = '';
  }

  parseCSV(csvText: string): void {
    const rows = csvText
      .split(/\r?\n/)
      .map((row) => row.trim())
      .filter((row) => row.length > 0);

    if (rows.length < 2) {
      this.toastr.warning('The CSV file is empty or has no employee records.', 'No records');
      return;
    }

    const headers = rows[0].split(',').map((header) => header.trim().toLowerCase());

    const requiredHeaders = ['full name', 'email', 'department', 'designation', 'role'];

    const hasRequiredHeaders = requiredHeaders.every((header) => headers.includes(header));

    if (!hasRequiredHeaders) {
      this.toastr.warning(
        'Invalid CSV format. The CSV must contain: Full Name, Email, Department, Designation, Role.',
        'Invalid',
      );
      return;
    }

    const employees: EmployeeFormPayload[] = rows
      .slice(1)
      .map((row) => {
        const values = row.split(',').map((value) => value.trim());

        return {
          fullName: values[0],
          email: values[1],
          department: values[2],
          designation: values[3],
          role: values[4],
          clientResetUrl: `${window.location.origin}/auth/reset-password`,
        } as EmployeeFormPayload;
      })
      .filter(
        (employee) =>
          employee.fullName &&
          employee.email &&
          employee.department &&
          employee.designation &&
          employee.role,
      );

    if (employees.length === 0) {
      this.toastr.warning('No valid employee records were found in the CSV.', 'Invalid');
      return;
    }

    console.log('Employees from CSV:', employees);

    employees.forEach((employee) => {
      this.save.emit(employee);
    });

    // alert(`${employees.length} employee(s) imported successfully.`);
    this.toastr.success(
      `${employees.length} employee(s) imported successfully.`,
      'Import Successful',
    );

    this.onClose();
  }

  onClose(): void {
    this.AddEmployeeForm.reset({
      fullName: '',
      email: '',
      department: 'Engineering',
      designation: '',
      role: 'Employee',
      clientResetUrl: `${window.location.origin}/auth/reset-password`,
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
