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
