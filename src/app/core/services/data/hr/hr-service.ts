import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../../evironments/environment';

const routes = {
  dashboard: 'Dashboard/admin-stats',
  leaveRequest: 'LeaveRequests',
  requestById: 'LeaveRequests/{id}',
  employees: 'Users',
  approveLeaveRequest: 'LeaveRequests/{id}/approve',
  rejectLeaveRequest: 'LeaveRequests/{id}/reject',
  editUser: 'Profile',
  leaveTpe: 'LeaveTypes',
  departments: 'Departments',
  Department: 'Departments',
  Users: 'Users',
  notificationSettings: 'Settings/notifications',
  onboarding: 'Onboarding',
  registerOrganization: 'Auth/register-organization',
  organizationSettings: 'Settings/organization',
};

@Injectable({
  providedIn: 'root',
})
export class HrService {
  baseUrl: string = environment.apiBaseUrl;
  leaveRequestUpdated = new Subject<{ id: string; status: string }>();

  constructor(private http: HttpClient) {}

  getHrDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.dashboard}`);
  }

  getAllLeaveRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.leaveRequest}`);
  }

  getAllEmployees(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.employees}`);
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.Users}`);
  }

  getRequestById(id: string): Observable<any> {
    const url = `${this.baseUrl}${routes.requestById.replace('{id}', id)}`;
    return this.http.get(url);
  }

  getLeaveTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.leaveTpe}`);
  }

  createLeaveType(payload: { name: string; defaultDays: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}${routes.leaveTpe}`, payload);
  }

  getDepartments(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.Department}`);
  }

  createDepartment(
    payload: { name: string; teamLeadName?: string; teamLeadId?: string } | any,
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}${routes.Department}`, payload);
  }

  approveLeaveRequest(id: string): Observable<any> {
    const url = `${this.baseUrl}${routes.approveLeaveRequest.replace('{id}', id)}`;
    return this.http
      .post(url, {})
      .pipe(tap(() => this.leaveRequestUpdated.next({ id, status: 'Approved' })));
  }

  rejectLeaveRequest(id: string): Observable<any> {
    const url = `${this.baseUrl}${routes.rejectLeaveRequest.replace('{id}', id)}`;
    return this.http
      .post(url, {})
      .pipe(tap(() => this.leaveRequestUpdated.next({ id, status: 'Rejected' })));
  }

  editUserProfile(updatedData: any): Observable<any> {
    const url = `${this.baseUrl}${routes.editUser}`;
    return this.http.put(url, updatedData);
  }

  getNotificationSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.notificationSettings}`);
  }

  updateNotificationSettings(payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${routes.notificationSettings}`, payload);
  }

  registerOrganization(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}${routes.registerOrganization}`, formData);
  }

  getOrganizationSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.organizationSettings}`);
  }
}