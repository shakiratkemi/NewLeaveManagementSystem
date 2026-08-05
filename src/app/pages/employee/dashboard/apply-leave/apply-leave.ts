import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export type LeaveType = 'Annual' | 'Sick' | 'Medical' | 'Personal';

export interface Leave {
  leaveType: LeaveType;
  startDate: any;
  endDate: any;
  duration: number;
  reason: string;
}

@Component({
  selector: 'app-applyleave',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './apply-leave.html',
  styles: ``,
})
export class Applyleave {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() submitLeave = new EventEmitter<Partial<Leave>>();

  leaveForm!: FormGroup;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.leaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      duration: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  onClose(): void {
    this.leaveForm.reset();
    this.close.emit();
  }

  onSubmit(): void {
    if (this.leaveForm.valid) {
      const formValue = this.leaveForm.value;

      this.submitLeave.emit({
        ...formValue,
        id: '',
        status: 'Pending',
      });

      this.onClose();
    }
  }
}
