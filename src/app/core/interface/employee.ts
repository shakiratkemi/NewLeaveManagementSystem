export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  annualLeaveBalance: number;
  totalAnnualLeave: number;
  sickLeaveBalance: number;
  totalSickLeave: number;
  status: 'Active' | 'On Leave' | 'Inactive';
}

export interface DashboardData {
  employeeName: string;
  pendingRequestsCount: number;
  approvedLeavesCount: number;
  rejectedLeavesCount: number;
  totalLeaveDaysRemaining: number;
}

export interface ProfileDetails {
  id: number;
  fullName: string;
  email: string;
  role: string;
  department: string;
  designation: string;
  leaveBalance: number;
  createdAt: number;
}

export interface LeaveTypes {
  id: string;
  name: string;
  defaultDays: number;
}

//  POST LeaveRequests

export interface LeaveRequest {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  requestComments: string;
}

// GET LeaveRequests

export type LeaveRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequestHistory {
  id: string;
  startDate: string;
  endDate: string;
  leaveTypeId: string;
  leaveType: LeaveTypes;
  employeeId: string;

  employee?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    department: string;
    designation: string;
    leaveBalance: number;
  };

  status?: LeaveRequestStatus;
  reason?: string;
  requestComments?: string;
  duration?: number;
}

export interface LeaveRequestsResponse {
  success: boolean;
  message: string;
  data: LeaveRequestHistory[];
  errors?: unknown;
}

export interface LeaveHistoryRow {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: LeaveRequestStatus;
  reason: string;
}
