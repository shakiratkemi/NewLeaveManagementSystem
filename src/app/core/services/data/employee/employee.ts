import { Injectable } from '@angular/core';
import { environment } from '../../../../../evironments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { Observable, of } from 'rxjs';
import {
  LeaveRequest,
  LeaveRequestHistory,
  LeaveRequestsResponse,
  TeamMember,
  LeaveTypes,
} from '../../../interface/employee';

const routes = {
  dashboard: 'Dashboard/user-stats',
  leaveTypes: 'LeaveTypes',
  leaveTypeById: 'LeaveTypeById',
  leaveRequests: 'LeaveRequests',
  leaveRequestById: 'LeaveRequests/{id}',
  profile: 'Profile',
  approvedLeaveRequests: 'LeaveRequests/approved',
};

@Injectable({
  providedIn: 'root',
})
export class Employee {
  baseUrl: string = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Dashboard
  getEmployeeDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.dashboard}`);
  }

  // Leave Types
  getLeaveTypes(): Observable<LeaveTypes[]> {
    return this.http.get<LeaveTypes[]>(`${this.baseUrl}${routes.leaveTypes}`);
  }

  // Temporary mock data until the team-members endpoint is available.
  getTeamMembers(): Observable<TeamMember[]> {
    return of([
      { id: 'team-member-001', name: 'Alex Johnson', email: 'alex.johnson@example.com' },
      { id: 'team-member-002', name: 'Jordan Smith', email: 'jordan.smith@example.com' },
      { id: 'team-member-003', name: 'Taylor Williams', email: 'taylor.williams@example.com' },
      { id: 'team-member-004', name: 'Morgan Brown', email: 'morgan.brown@example.com' },
    ]);
  }

  // Leave Requests
  createLeaveRequest(data: LeaveRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}${routes.leaveRequests}`, data);
  }

  getLeaveRequests(): Observable<LeaveRequestsResponse> {
    return this.http.get<LeaveRequestsResponse>(`${this.baseUrl}${routes.leaveRequests}`);
  }

  getApprovedLeaveRequests(startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get(`${this.baseUrl}${routes.approvedLeaveRequests}`, { params });
  }

  getLeaveRequestById(id: string): Observable<LeaveRequestsResponse> {
    return this.http.get<LeaveRequestsResponse>(
      `${this.baseUrl}${routes.leaveRequestById.replace('{id}', id)}`,
    );
  }

  updateLeaveRequestById(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${routes.leaveRequestById.replace('{id}', id)}`, data);
  }

  deleteLeaveRequestById(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${routes.leaveRequestById}/${id}`);
  }

  // Profile
  getProfileDetails(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}${routes.profile}`)
      .pipe(map((response: any) => response?.data ?? response));
  }

  updateProfileDetails(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${routes.profile}`, data);
  }
}