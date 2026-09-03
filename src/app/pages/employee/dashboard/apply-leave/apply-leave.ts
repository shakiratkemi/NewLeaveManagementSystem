import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee } from '../../../../core/services/data/employee/employee';
import { LeaveTypes } from '../../../../core/interface/employee';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../../../shared/components/leave-confirmation-dialog/leave-confirmation-dialog';
import { DateRange } from "../../../../shared/components/date-range/date-range";

@Component({
  selector: 'app-applyleave',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, DateRange],
  templateUrl: './apply-leave.html',
  styles: ``,
})
export class Applyleave implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  leaveForm!: FormGroup;
  leaveTypes: LeaveTypes[] = [];
  minEndDate = '';
  errorMessage = '';
  successMessage = '';
  selectedLeaveType: any;

  constructor(
    private fb: FormBuilder,
    private employeeService: Employee,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
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
      next: (response: any) => {
        let types: any[] = [];
        if (Array.isArray(response)) {
          types = response;
        } else if (Array.isArray(response?.data)) {
          types = response.data;
        } else if (Array.isArray(response?.leaveTypes)) {
          types = response.leaveTypes;
        } else if (response?.data && typeof response.data === 'object') {
          for (const key of Object.keys(response.data)) {
            if (Array.isArray(response.data[key])) {
              types = response.data[key];
              break;
            }
          }
        }

        const mapped = types
          .map((item: any) => {
            if (typeof item === 'string') {
              return { id: item, name: item, defaultDays: 10 };
            }
            const rawId = item.id || item.leaveTypeId || item.typeId || item.name || '';
            const rawName = item.name || item.leaveTypeName || item.type || item.title || 'Leave';
            const days = item.defaultDays ?? item.days ?? item.allottedDays ?? 10;
            return {
              id: String(rawId),
              name: String(rawName),
              defaultDays: Number(days),
            };
          })
          .filter((item: any) => Boolean(item.id && item.name));

        if (mapped.length > 0) {
          this.leaveTypes = mapped;
        } else {
          this.leaveTypes = [
            { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Annual Leave', defaultDays: 20 },
            { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Sick Leave', defaultDays: 10 },
            {
              id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
              name: 'Maternity Leave',
              defaultDays: 90,
            },
          ];
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Leave Type API error:', error);
        this.leaveTypes = [
          { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Annual Leave', defaultDays: 20 },
          { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Sick Leave', defaultDays: 10 },
          { id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012', name: 'Maternity Leave', defaultDays: 90 },
        ];
        this.cdr.detectChanges();
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


  onRangeSelected(range: any): void {
    if(range.dayCount > this.selectedLeaveType?.defaultDays ){
      this.toastr.error('You cannot apply for more days than alloted, Contact HR for more information');
      this.leaveForm.get('duration')?.setValue('');
      this.leaveForm.get('startDate')?.setValue('');
      this.leaveForm.get('endDate')?.setValue('');
      return;
    }else{
    this.leaveForm.patchValue({
    startDate: range.startDate ? range.startDate.toISOString().slice(0, 10) : '',
    endDate: range.endDate ? range.endDate.toISOString().slice(0, 10) : '',
    duration: range.dayCount.toString(),
  });}
  

  console.log("range", this.leaveForm.value);
}
selectLeaveType(event: Event): void {
  console.log(event);
const eventTypeId = (event.target as HTMLSelectElement).value;
  const selectedLeaveType = this.leaveTypes.find((t) => t.id === eventTypeId);
  console.log("selectedLeaveType", selectedLeaveType);
  this.selectedLeaveType = selectedLeaveType;



}

  onSubmit(): void {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.leaveForm.value;

    const selectedType = this.leaveTypes.find((t) => t.id === formValue.leaveType);

    const leaveTypeName = selectedType ? selectedType.name : formValue.leaveType;

    const leaveRequest = {
      leaveTypeId: formValue.leaveType,
      leaveTypeName: leaveTypeName,
      startDate: new Date(formValue.startDate).toISOString(),
      endDate: new Date(formValue.endDate).toISOString(),
      numberOfDays: Number(formValue.duration) || 1,
      duration: Number(formValue.duration) || 1,
      days: Number(formValue.duration) || 1,
      reason: formValue.reason,
      requestComments: formValue.reason,
    };

    console.log('Leave Request ready for confirmation:', leaveRequest);

    this.openConfirmationDialog(leaveRequest);
  }

  openConfirmationDialog(leaveRequest: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'Submit Leave',
        content: 'Are you sure you want to submit this leave request?',
        acceptText: 'Yes, Submit',
      },
      panelClass: 'custom-confirmation-dialog',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action) {
        this.submitLeaveRequest(leaveRequest);
      }
    });
  }

  submitLeaveRequest(leaveRequest: any): void {
    console.log('Submitting confirmed leave request:', leaveRequest);

    this.employeeService.createLeaveRequest(leaveRequest).subscribe({
      next: (response: any) => {
        console.log('Leave request created successfully:', response);

        this.toastr.success('Leave request submitted successfully.', 'Leave Request');

        this.onClose();

        this.router.navigateByUrl('/employee/leave-history');
      },

      error: (error) => {
        console.error('Leave request API error:', error);

        let msg = 'Unable to submit leave request. Please try again.';

        if (error?.error) {
          if (error.error.errors && typeof error.error.errors === 'object') {
            const errObj = error.error.errors;
            const msgs: string[] = [];

            for (const key of Object.keys(errObj)) {
              if (Array.isArray(errObj[key])) {
                msgs.push(`${key}: ${errObj[key].join(', ')}`);
              } else if (typeof errObj[key] === 'string') {
                msgs.push(`${key}: ${errObj[key]}`);
              }
            }

            if (msgs.length > 0) {
              msg = msgs.join(' | ');
            }
          } else if (typeof error.error === 'string') {
            msg = error.error;
          } else if (error.error.message) {
            msg = error.error.message;
          } else if (error.error.title) {
            msg = error.error.title;
          }
        }

        this.errorMessage = msg;

        this.toastr.error(msg, 'Leave Request Error');

        this.cdr.detectChanges();
      },
    });
  }

  onClose(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.leaveForm.reset();
    this.close.emit();
    this.cdr.detectChanges();
  }
}
