import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth-service';
import { EmployeeFormPayload } from '../../../core/interface/hr';

export interface DepartmentOption {
  id: string;
  name: string;
}

export interface ParsedCsvEmployee {
  fullName: string;
  email: string;
  departmentName: string;
  departmentId: string;
  designation: string;
  role: string;
  isValid: boolean;
  validationError?: string;
}

@Component({
  selector: 'app-addemployee-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './addemployee-confirmation-dialog.html',
  styles: ``,
})
export class AddemployeeConfirmationDialog implements OnInit {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  @Input() isOpen = false;
  @Input() departments: readonly DepartmentOption[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<EmployeeFormPayload>();
  @Output() bulkSave = new EventEmitter<EmployeeFormPayload[]>();
  @Output() saveComplete = new EventEmitter<void>();
  @Output() switchToSingle = new EventEmitter<void>();

  selectedFile: File | null = null;
  parsedRows: ParsedCsvEmployee[] = [];
  unmatchedDepartments: string[] = [];
  parseError: string | null = null;

  isDragging = false;
  isUploading = false;
  uploadProgress = 0;
  uploadCurrent = 0;
  uploadTotal = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    @Optional() private authService?: AuthService,
    @Optional() private toastr?: ToastrService,
    @Optional() public dialogRef?: MatDialogRef<AddemployeeConfirmationDialog>,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData?: { departments?: DepartmentOption[] },
  ) {
    if (this.dialogData?.departments) {
      this.departments = this.dialogData.departments;
    }
  }

  ngOnInit(): void {
    if (this.dialogRef) {
      // In MatDialog mode, treat as open
      this.isOpen = true;
    }
  }

  get effectiveDepartments(): readonly DepartmentOption[] {
    return this.departments || [];
  }

  get validRowsCount(): number {
    return this.parsedRows.filter((r) => r.isValid).length;
  }

  get invalidRowsCount(): number {
    return this.parsedRows.filter((r) => !r.isValid).length;
  }

  get totalRowsCount(): number {
    return this.parsedRows.length;
  }

  get formattedFileSize(): string {
    if (!this.selectedFile) return '';
    const bytes = this.selectedFile.size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  triggerFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
    input.value = '';
  }

  handleFile(file: File): void {
    const isCsv = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
    if (!isCsv) {
      this.toastr?.warning('Please select a valid CSV file (.csv).', 'Invalid File Type');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toastr?.warning('File size exceeds the 5MB limit.', 'File Too Large');
      return;
    }

    this.selectedFile = file;
    this.parseError = null;
    this.parsedRows = [];
    this.unmatchedDepartments = [];

    const reader = new FileReader();
    reader.onload = () => {
      const csvText = reader.result as string;
      this.parseCSV(csvText);
    };
    reader.onerror = () => {
      this.parseError = 'Failed to read file. Please try again.';
      this.toastr?.error('Unable to read the CSV file.', 'Read Error');
      this.cdr.detectChanges();
    };

    reader.readAsText(file);
  }

  private parseCSV(csvText: string): void {
    const rows = csvText
      .split(/\r?\n/)
      .map((row) => row.trim())
      .filter((row) => row.length > 0);

    if (rows.length < 2) {
      this.parseError = 'The CSV file is empty or does not contain any employee rows.';
      this.toastr?.warning('The CSV file has no employee records.', 'Empty CSV');
      this.cdr.detectChanges();
      return;
    }

    // Parse headers
    const rawHeaders = this.splitCsvRow(rows[0]);
    const headers = rawHeaders.map((h) => h.toLowerCase().trim().replace(/['"]/g, ''));

    const nameIdx = this.findHeaderIndex(headers, [
      'full name',
      'fullname',
      'name',
      'employee name',
    ]);
    const emailIdx = this.findHeaderIndex(headers, ['email', 'email address', 'employee email']);
    const deptIdx = this.findHeaderIndex(headers, ['department', 'dept', 'department name']);
    const desigIdx = this.findHeaderIndex(headers, [
      'designation',
      'designation/title',
      'job title',
      'title',
    ]);
    const roleIdx = this.findHeaderIndex(headers, ['role', 'user role']);

    const missingHeaders: string[] = [];
    if (nameIdx === -1) missingHeaders.push('Full Name');
    if (emailIdx === -1) missingHeaders.push('Email');
    if (deptIdx === -1) missingHeaders.push('Department');
    if (desigIdx === -1) missingHeaders.push('Designation');
    if (roleIdx === -1) missingHeaders.push('Role');

    if (missingHeaders.length > 0) {
      this.parseError = `Invalid CSV format. Missing required columns: ${missingHeaders.join(', ')}.`;
      this.toastr?.warning(this.parseError, 'Invalid Headers');
      this.cdr.detectChanges();
      return;
    }

    const unmatchedSet = new Set<string>();
    const parsed: ParsedCsvEmployee[] = [];

    for (let i = 1; i < rows.length; i++) {
      const line = rows[i];
      const values = this.splitCsvRow(line);

      const fullName = (values[nameIdx] || '').trim();
      const email = (values[emailIdx] || '').trim();
      const departmentName = (values[deptIdx] || '').trim();
      const designation = (values[desigIdx] || '').trim();
      const role = (values[roleIdx] || 'Employee').trim();

      const matchedDept = this.effectiveDepartments.find(
        (d) => d.name.trim().toLowerCase() === departmentName.toLowerCase(),
      );

      let isValid = true;
      let validationError = '';

      if (!fullName) {
        isValid = false;
        validationError = 'Missing Full Name';
      } else if (!email || !email.includes('@')) {
        isValid = false;
        validationError = 'Invalid Email';
      } else if (!departmentName) {
        isValid = false;
        validationError = 'Missing Department';
      } else if (!matchedDept) {
        isValid = false;
        validationError = `Unmatched Dept: "${departmentName}"`;
        unmatchedSet.add(departmentName);
      } else if (!designation) {
        isValid = false;
        validationError = 'Missing Designation';
      } else if (!role) {
        isValid = false;
        validationError = 'Missing Role';
      }

      parsed.push({
        fullName,
        email,
        departmentName,
        departmentId: matchedDept?.id ?? '',
        designation,
        role: role || 'Employee',
        isValid,
        validationError: isValid ? undefined : validationError,
      });
    }

    this.parsedRows = parsed;
    this.unmatchedDepartments = Array.from(unmatchedSet);

    if (this.unmatchedDepartments.length > 0) {
      this.toastr?.warning(
        `Department(s) not found in system: ${this.unmatchedDepartments.join(', ')}. These records will be skipped.`,
        'Unmatched Departments',
      );
    }

    if (this.validRowsCount === 0) {
      this.parseError = 'No valid employee records found to import.';
    }

    this.cdr.detectChanges();
  }

  private findHeaderIndex(headers: string[], candidates: string[]): number {
    for (const candidate of candidates) {
      const idx = headers.indexOf(candidate);
      if (idx !== -1) return idx;
    }
    return -1;
  }

  private splitCsvRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  }

  downloadSampleTemplate(): void {
    const sampleDept1 = this.effectiveDepartments[0]?.name || 'Engineering';
    const sampleDept2 = this.effectiveDepartments[1]?.name || 'Human Resources';

    const csvContent = [
      'Full Name,Email,Department,Designation,Role',
      `Jane Doe,jane.doe@company.com,${sampleDept1},Software Engineer,Employee`,
      `John Smith,john.smith@company.com,${sampleDept2},HR Specialist,Employee`,
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'employee_bulk_upload_sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
    this.parsedRows = [];
    this.unmatchedDepartments = [];
    this.parseError = null;
    this.isUploading = false;
    this.uploadProgress = 0;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  async uploadEmployees(): Promise<void> {
    const validRows = this.parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      this.toastr?.warning('No valid employee records to import.', 'Cannot Upload');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadCurrent = 0;
    this.uploadTotal = validRows.length;

    const payloads: EmployeeFormPayload[] = validRows.map((r) => ({
      fullName: r.fullName,
      email: r.email,
      departmentId: r.departmentId,
      designation: r.designation,
      role: r.role,
      clientResetUrl: `${window.location.origin}/reset-token`,
    }));

    let successCount = 0;
    let failCount = 0;

    if (this.authService) {
      for (let i = 0; i < payloads.length; i++) {
        const payload = payloads[i];
        this.uploadCurrent = i + 1;
        this.uploadProgress = Math.round(((i + 1) / payloads.length) * 100);
        this.cdr.detectChanges();

        try {
          await firstValueFrom(this.authService.createEmployee(payload));
          successCount++;
          this.save.emit(payload);
        } catch (err) {
          console.error('Failed to create employee:', payload.email, err);
          failCount++;
        }
      }

      this.isUploading = false;

      if (successCount > 0) {
        this.toastr?.success(
          `${successCount} employee(s) imported successfully.` +
            (failCount > 0 ? ` (${failCount} failed)` : ''),
          'Import Successful',
        );
      } else {
        this.toastr?.error(
          'Failed to import employees. Please review error details.',
          'Import Failed',
        );
      }

      this.bulkSave.emit(payloads);
      this.saveComplete.emit();
      this.handleClose();
    } else {
      // Direct emit fallback
      payloads.forEach((payload) => this.save.emit(payload));
      this.bulkSave.emit(payloads);
      this.toastr?.success(
        `${payloads.length} employee(s) imported successfully.`,
        'Import Successful',
      );
      this.saveComplete.emit();
      this.handleClose();
    }
  }

  handleClose(): void {
    this.clearSelectedFile();
    this.isOpen = false;
    if (this.dialogRef) {
      this.dialogRef.close({ action: false });
    }
    this.close.emit();
  }

  onSwitchToSingle(): void {
    this.handleClose();
    this.switchToSingle.emit();
  }
}
