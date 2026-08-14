import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { HrService } from '../../../../core/services/data/hr/hr-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditEmployeeProfile } from '../../../../core/interface/hr';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
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

  departments: string[] = ['All'];

  constructor(
    private fb: FormBuilder,
    private hrService: HrService,
    private toastr: ToastrService,
  ) {
    this.editProfileForm = this.fb.group({
      fullName: ['', Validators.required],
      department: ['', Validators.required],
      designation: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData) {
      this.editProfileForm.patchValue({
        fullName: this.initialData.fullName ?? '',
        department: this.initialData.department ?? '',
        designation: this.initialData.designation ?? '',
      });
    }
  }

  loadDepartments(): void {
    this.hrService.getDepartments().subscribe({
      next: (res: any) => {
        let deptList: any[] = [];

        if (Array.isArray(res)) {
          deptList = res;
        } else if (Array.isArray(res?.data)) {
          deptList = res.data;
        } else if (Array.isArray(res?.departments)) {
          deptList = res.departments;
        } else if (Array.isArray(res?.data?.departments)) {
          deptList = res.data.departments;
        }

        const names: string[] = deptList
          .map((d: any) => {
            if (typeof d === 'string') return d;
            return d.departmentName || d.name || d.title || '';
          })
          .filter(Boolean);

        this.departments = Array.from(new Set(names));

        // If form has no department set yet and we have options, set first as default
        if (!this.editProfileForm.get('department')?.value && this.departments.length > 0) {
          this.editProfileForm.patchValue({
            department: this.departments[0],
          });
        }
      },
      error: (err: any) => {
        const errorMsg = err?.error?.message || 'Failed to load departments in edit moda.';
        this.toastr.error(errorMsg, 'Update Failed');
      },
    });
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
