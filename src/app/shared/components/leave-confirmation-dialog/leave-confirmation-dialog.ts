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
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  close(): void {
    this.dialogRef.close({ action: false });
  }

  confirm(): void {
    this.dialogRef.close({ action: true });
  }
}
