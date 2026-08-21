import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

export interface LeaveConfirmationData {
  action: 'approve' | 'decline';
  title?: string;
  message?: string;
  employeeName?: string;
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  reason?: string;
}

export interface LeaveConfirmationResult {
  confirmed: boolean;
  action: 'approve' | 'decline';
  remarks?: string;
}

@Component({
  selector: 'app-leave-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './leave-confirmation-dialog.html',
  styleUrl: './leave-confirmation-dialog.css',
})
export class LeaveConfirmationDialog {
  remarks: string = '';

  constructor(
    public dialogRef: MatDialogRef<LeaveConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: LeaveConfirmationData
  ) {}

  get isApprove(): boolean {
    return this.data.action === 'approve';
  }

  get isDecline(): boolean {
    return this.data.action === 'decline';
  }

  get dialogTitle(): string {
    if (this.data.title) return this.data.title;
    return this.isApprove ? 'Approve Leave Request' : 'Decline Leave Request';
  }

  get dialogMessage(): string {
    if (this.data.message) return this.data.message;
    if (this.isApprove) {
      return `Are you sure you want to approve this leave request for ${this.data.employeeName || 'this employee'}?`;
    } else {
      return `Are you sure you want to decline this leave request for ${this.data.employeeName || 'this employee'}?`;
    }
  }

  confirm(): void {
    const result: LeaveConfirmationResult = {
      confirmed: true,
      action: this.data.action,
      remarks: this.remarks.trim() || undefined,
    };
    this.dialogRef.close(result);
  }

  cancel(): void {
    const result: LeaveConfirmationResult = {
      confirmed: false,
      action: this.data.action,
    };
    this.dialogRef.close(result);
  }
}
