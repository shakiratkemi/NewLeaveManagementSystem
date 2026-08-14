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
};

@Injectable({
  providedIn: 'root',
})
export class HrService {
  baseUrl: string = environment.apiBaseUrl;
  // Broadcast when a leave request changes (id + new status)
  leaveRequestUpdated = new Subject<{ id: string; status: string }>();

  constructor(private http: HttpClient) {}

  // Dashboard
  getHrDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.dashboard}`);
  }

  getAllLeaveRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.leaveRequest}`);
  }

  getAllEmployees(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.employees}`);
  }

  getRequestById(id: string): Observable<any> {
    const url = `${this.baseUrl}${routes.requestById.replace('{id}', id)}`;
    return this.http.get(url);
  }

  getLeaveTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.leaveTpe}`);
  }

  getDepartments(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.departments}`);
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
}
