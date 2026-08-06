import { Injectable } from '@angular/core';
import { environment } from '../../../../../evironments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

const routes = {
  dashboard: 'Dashboard/user-stats',
  leaveTypes: 'LeaveTypes',
  leaveTypeById: 'LeaveTypeById',
  leaveRequests: 'LeaveRequests',
  leaveRequestById: 'LeaveRequestsById',
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
  getLeaveTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.leaveTypes}`);
  }

  getLeaveTypeById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.leaveTypeById}/${id}`);
  }

  // Leave Requests
  createLeaveRequest(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${routes.leaveRequests}`, data);
  }

  getLeaveRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.leaveRequests}`);
  }

  getLeaveRequestById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.leaveRequestById}/${id}`);
  }

  updateLeaveRequestById(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${routes.leaveRequestById}/${id}`, data);
  }

  deleteLeaveRequestById(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${routes.leaveRequestById}/${id}`);
  }
}
