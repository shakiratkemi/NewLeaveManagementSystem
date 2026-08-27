import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeFormPayload } from '../../../../core/interface/hr';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../../../shared/components/leave-confirmation-dialog/leave-confirmation-dialog';

export interface DepartmentOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatDialogModule],
  templateUrl: './add-employee.html',
  styles: ``,
})
export class AddEmployee {
  @Input() isOpen = false;
  @Input() departments: readonly DepartmentOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<EmployeeFormPayload>();

  AddEmployeeForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {
    this.AddEmployeeForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      departmentId: ['', Validators.required],
      designation: ['', Validators.required],
      role: ['Employee', Validators.required],
      clientResetUrl: [`${window.location.origin}/reset-token`, Validators.required],
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

    const unmatchedDepartments = new Set<string>();

    const employees: EmployeeFormPayload[] = rows
      .slice(1)
      .map((row) => {
        const values = row.split(',').map((value) => value.trim());
        const deptName = values[2];
        const matchedDept = this.departments.find(
          (d) => d.name.toLowerCase() === deptName?.toLowerCase(),
        );

        if (deptName && !matchedDept) {
          unmatchedDepartments.add(deptName);
        }

        return {
          fullName: values[0],
          email: values[1],
          departmentId: matchedDept?.id ?? '',
          designation: values[3],
          role: values[4],
          clientResetUrl: `${window.location.origin}/reset-token`,
        } as EmployeeFormPayload;
      })
      .filter(
        (employee) =>
          employee.fullName &&
          employee.email &&
          employee.departmentId &&
          employee.designation &&
          employee.role,
      );

    if (unmatchedDepartments.size > 0) {
      this.toastr.warning(
        `These departments in the CSV don't match existing departments and were skipped: ${Array.from(unmatchedDepartments).join(', ')}`,
        'Unmatched Departments',
      );
    }

    if (employees.length === 0) {
      this.toastr.warning('No valid employee records were found in the CSV.', 'Invalid');
      return;
    }

    console.log('Employees from CSV:', employees);

    employees.forEach((employee) => {
      this.save.emit(employee);
    });

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
      departmentId: '',
      designation: '',
      role: 'Employee',
      clientResetUrl: `${window.location.origin}/reset-token`,
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
    this.openConfirmationDialog(payload);
  }

  openConfirmationDialog(payload: EmployeeFormPayload): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'Add Employee',
        content: 'Are you sure you want to add this employee?',
        acceptText: 'Yes, Add Employee',
      },
      panelClass: 'custom-confirmation-dialog',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action) {
        this.save.emit(payload);
        this.toastr.success('Employee added successfully.', 'Add Employee');
        this.onClose();
      }
    });
  }
}