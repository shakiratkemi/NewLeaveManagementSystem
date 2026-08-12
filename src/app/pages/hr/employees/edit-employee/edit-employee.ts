import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { HrService } from '../../../../core/services/data/hr/hr-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditEmployeeProfile } from '../../../../core/interface/hr';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-edit-employee',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-employee.html',
  styles: ``,
})
export class EditEmployee {
  editProfileForm!: FormGroup;
  @Input() isOpen = false;
  @Input() initialData?: EditEmployeeProfile | null;
  @Output() close = new EventEmitter<void>();
  @Output() profileUpdated = new EventEmitter<EditEmployeeProfile>();

  departments: string[] = ['Engineering', 'Design', 'Marketing', 'HR', 'Sales'];

  constructor(
    private fb: FormBuilder,
    private hrService: HrService,
  ) {
    this.editProfileForm = this.fb.group({
      fullName: ['', Validators.required],
      department: ['Engineering', Validators.required],
      designation: ['', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData) {
      this.editProfileForm.patchValue({
        fullName: this.initialData.fullName ?? '',
        department: this.initialData.department ?? 'Engineering',
        designation: this.initialData.designation ?? '',
      });
    }
  }

  onClose(): void {
    this.editProfileForm.reset();
    this.close.emit();
  }

  onSubmit(): void {
    if (this.editProfileForm.invalid) {
      this.editProfileForm.markAllAsTouched();
      return;
    }

    const payload: EditEmployeeProfile = {
      email: this.initialData?.email ?? '',
      ...this.editProfileForm.value,
    };

    console.log('Update payload with target email:', payload);
    this.profileUpdated.emit(payload);
  }
}
