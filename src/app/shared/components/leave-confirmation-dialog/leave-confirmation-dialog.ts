import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

export interface ConfirmationDialogData {
  title: string;
  content: string;
  cancelText?: string;
  acceptText?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './leave-confirmation-dialog.html',
  styleUrl: './leave-confirmation-dialog.css',
})
export class ConfirmationDialog {
  // constructor(
  //   public dialogRef: MatDialogRef<LeaveConfirmationDialog>,
  //   @Inject(MAT_DIALOG_DATA) public data: LeaveConfirmationData,
  // ) {}

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData,
  ) {}

  close(): void {
    this.dialogRef.close({ action: false });
  }

  // get variant(): 'emerald' | 'rose' | 'indigo' | 'amber' {
  //   if (this.data.variant) return this.data.variant;
  //   if (this.data.action === 'decline' || this.data.action === 'delete') return 'rose';
  //   if (this.data.action === 'approve') return 'emerald';
  //   return 'indigo';
  // }

  // get isApprove(): boolean {
  //   return this.variant === 'emerald';
  // }

  // get isDecline(): boolean {
  //   return this.variant === 'rose';
  // }

  // get isIndigo(): boolean {
  //   return this.variant === 'indigo';
  // }

  // get isAmber(): boolean {
  //   return this.variant === 'amber';
  // }

  // get dialogTitle(): string {
  //   if (this.data.title) return this.data.title;
  //   if (this.data.action === 'approve') return 'Approve Leave Request';
  //   if (this.data.action === 'decline') return 'Decline Leave Request';
  //   if (this.data.action === 'delete') return 'Delete Item';
  //   return 'Confirm Action';
  // }

  // get dialogMessage(): string {
  //   if (this.data.message) return this.data.message;
  //   if (this.data.action === 'approve') {
  //     return `Are you sure you want to approve this leave request for ${this.data.employeeName || 'this employee'}?`;
  //   }
  //   if (this.data.action === 'decline') {
  //     return `Are you sure you want to decline this leave request for ${this.data.employeeName || 'this employee'}?`;
  //   }
  //   return 'Are you sure you want to proceed with this action?';
  // }

  // get confirmText(): string {
  //   if (this.data.confirmButtonText) return this.data.confirmButtonText;
  //   if (this.data.action === 'approve') return 'Approve Leave';
  //   if (this.data.action === 'decline') return 'Decline Leave';
  //   if (this.data.action === 'delete') return 'Delete';
  //   return 'Confirm';
  // }

  // get cancelText(): string {
  //   return this.data.cancelButtonText || 'Cancel';
  // }

  // get shouldShowRemarks(): boolean {
  //   if (this.data.showRemarksField !== undefined) return this.data.showRemarksField;
  //   return this.data.action === 'decline';
  // }

  // confirm(): void {
  //   this.dialogRef.close({ action: true });
  // }

  confirm(): void {
    this.dialogRef.close({ action: true });
  }
}
