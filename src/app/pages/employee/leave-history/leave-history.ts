import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { LeaveHistoryDetails } from './leave-history-details/leave-history-details';
import { PageEvent, MatPaginatorModule, MatPaginator } from '@angular/material/paginator';

export type Status = 'Pending' | 'Approved' | 'Rejected';
export type LeaveType = 'Annual' | 'Sick' | 'Medical' | 'Personal';

export interface LeaveRequest {
  id: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  duration: number;
  status: Status;
  reason: string;
}
export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 101,
    leaveType: 'Annual',
    startDate: '2026-08-10',
    endDate: '2026-08-17',
    duration: 6,
    status: 'Pending',
    reason: 'Family summer vacation',
  },
  {
    id: 102,
    leaveType: 'Sick',
    startDate: '2026-07-02',
    endDate: '2026-07-03',
    duration: 2,
    status: 'Approved',
    reason: 'Flu recovery and doctor appointment',
  },
  {
    id: 103,
    leaveType: 'Personal',
    startDate: '2026-06-15',
    endDate: '2026-06-15',
    duration: 1,
    status: 'Approved',
    reason: 'Home maintenance work',
  },
  {
    id: 104,
    leaveType: 'Medical',
    startDate: '2026-05-20',
    endDate: '2026-05-22',
    duration: 3,
    status: 'Approved',
    reason: 'Minor dental surgery',
  },
  {
    id: 105,
    leaveType: 'Annual',
    startDate: '2026-04-01',
    endDate: '2026-04-05',
    duration: 5,
    status: 'Rejected',
    reason: 'Spring break trip (overlapping project deadline)',
  },
  {
    id: 106,
    leaveType: 'Personal',
    startDate: '2026-08-25',
    endDate: '2026-08-25',
    duration: 1,
    status: 'Pending',
    reason: 'DMV appointment',
  },
  {
    id: 107,
    leaveType: 'Sick',
    startDate: '2026-03-12',
    endDate: '2026-03-13',
    duration: 2,
    status: 'Approved',
    reason: 'Severe migraine',
  },
  {
    id: 108,
    leaveType: 'Annual',
    startDate: '2026-09-18',
    endDate: '2026-09-25',
    duration: 6,
    status: 'Pending',
    reason: 'Annual family reunion trip',
  },
  {
    id: 109,
    leaveType: 'Medical',
    startDate: '2026-02-10',
    endDate: '2026-02-11',
    duration: 2,
    status: 'Approved',
    reason: 'Routine health checkup and blood tests',
  },
  {
    id: 110,
    leaveType: 'Personal',
    startDate: '2026-01-22',
    endDate: '2026-01-22',
    duration: 1,
    status: 'Rejected',
    reason: 'Car repairs and registration',
  },
];

@Component({
  selector: 'app-leave-history',
  imports: [CommonModule, LeaveHistoryDetails, MatPaginatorModule],
  templateUrl: './leave-history.html',
  styles: ``,
})
export class LeaveHistory {
  @Input() data: LeaveRequest[] = [];
  @Output() viewDetails = new EventEmitter<LeaveRequest>();
  @Output() cancelRequest = new EventEmitter<number>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  leaveRequests: LeaveRequest[] = MOCK_LEAVE_REQUESTS;
  selectedRequest: LeaveRequest | null = null;
  isModalOpen = false;
  constructor(private cdr: ChangeDetectorRef) {}

  handleViewDetails(request: LeaveRequest): void {
    console.log('Viewing details for request:', request);
    this.selectedRequest = request;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedRequest = null;
    this.cdr.detectChanges();
  }
  pageSize = 5;
  pageIndex = 0;
  pagedData: LeaveRequest[] = [];

  ngOnChanges(): void {
    this.updatePagedData();
  }

  ngAfterViewInit(): void {
    this.updatePagedData();
    this.cdr.detectChanges();
  }

  updatePagedData(): void {
    const list = this.data.length ? this.data : this.leaveRequests;
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedData = list.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedData();
  }
  onView(request: LeaveRequest, event: Event): void {
    event.stopPropagation();
    console.log('Table component clicked row:', request);
    this.handleViewDetails(request);
    this.viewDetails.emit(request);
  }

  onCancel(id: number, event: Event): void {
    event.stopPropagation();
    this.cancelRequest.emit(id);
  }
}
