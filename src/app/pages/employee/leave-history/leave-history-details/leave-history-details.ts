import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeaveHistoryRow } from '../../../../core/interface/employee';

@Component({
  selector: 'app-leave-history-details',
  imports: [CommonModule],
  templateUrl: './leave-history-details.html',
  styles: ``,
})
export class LeaveHistoryDetails {
  @Input() request: LeaveHistoryRow | null = null;
  @Input() isOpen = false;

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
