import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CommonModule } from '@angular/common';

export type LeaveType = 'Annual' | 'Sick' | 'Medical' | 'Personal';
export type Status = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  duration: number;
  status: Status;
  reason: string;
}


@Component({
  selector: 'app-leave-history-details',
  imports: [CommonModule],
  templateUrl: './leave-history-details.html',
  styles: ``,
})
export class LeaveHistoryDetails {
  @Input() request: LeaveRequest | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
