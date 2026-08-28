export interface LeaveBalanceItem {
  typeName: string;
  balance: number;
  total: number;
}

export type EmployeeRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  // Dynamic — one entry per leave type that exists in the system
  // (from GET /LeaveTypes / whatever the backend returns per employee),
  // instead of two fixed Annual/Sick fields.
  leaveBalances: LeaveBalanceItem[];
  status: 'Active' | 'On Leave' | 'Inactive';
};

export type EmployeeFormData = {
  name: string;
  email: string;
  role: string;
  password?: string;
  department: string;
  designation: string;
  totalAnnualLeave: number;
  totalSickLeave: number;
  status: EmployeeRecord['status'];
};

export interface EmployeeFormPayload {
  fullName: string;
  email: string;
  departmentId: string;
  designation: string;
  role: string;
  clientResetUrl?: string;
}

export interface HrLeaveRecord {
  requestId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  appliedOn: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approverName?: string;
  approverRemarks?: string;
  contactDetails?: string;
}

export interface EditEmployeeProfile {
  email: string;
  fullName: string;
  department: string;
  designation: string;
}


export interface AddEmployeeData {

}