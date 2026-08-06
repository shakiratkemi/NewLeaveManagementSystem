// import { Injectable } from '@angular/core';
// import { environment } from '../../../../../evironments/environment';
// import { HttpClient } from '@angular/common/http';

// import { Observable } from 'rxjs';
// import { LeaveRequest, LeaveTypes } from '../../../interface/employee';

// const routes = {
//   dashboard: 'Dashboard/user-stats',
//   leaveTypes: 'LeaveTypes',
//   leaveTypeById: 'LeaveTypeById',
//   leaveRequests: 'LeaveRequests',
//   leaveRequestById: 'LeaveRequestsById',
//   profile: 'Profile',
// };

// @Injectable({
//   providedIn: 'root',
// })
// export class Employee {
//   baseUrl: string = environment.apiBaseUrl;

//   constructor(private http: HttpClient) {}

//   // Dashboard
//   getEmployeeDashboard(): Observable<any> {
//     return this.http.get(`${this.baseUrl}${routes.dashboard}`);
//   }

//   // Leave Types
//   getLeaveTypes(): Observable<LeaveTypes[]> {
//     return this.http.get<LeaveTypes[]>(`${this.baseUrl}${routes.leaveTypes}`);
//   }

//   // getLeaveTypeById(id: string): Observable<any> {
//   //   return this.http.get(`${this.baseUrl}${routes.leaveTypeById}/${id}`);
//   // }

//   // Leave Requests
//   createLeaveRequest(data: LeaveRequest): Observable<any> {
//     return this.http.post(`${this.baseUrl}${routes.leaveRequests}`, data);
//   }

//   getLeaveRequests(): Observable<any> {
//     return this.http.get(`${this.baseUrl}${routes.leaveRequests}`);
//   }

//   getLeaveRequestById(id: string): Observable<any> {
//     return this.http.get(`${this.baseUrl}${routes.leaveRequestById}/${id}`);
//   }

//   updateLeaveRequestById(id: string, data: any): Observable<any> {
//     return this.http.put(`${this.baseUrl}${routes.leaveRequestById}/${id}`, data);
//   }

//   deleteLeaveRequestById(id: string): Observable<any> {
//     return this.http.delete(`${this.baseUrl}${routes.leaveRequestById}/${id}`);
//   }

//   //profile
//   getProfileDetails(): Observable<any> {
//     return this.http.get(`${this.baseUrl}${routes.profile}`);
//   }

//   updateProfileDetails(id: string, data: any): Observable<any> {
//     return this.http.put(`${this.baseUrl}${routes.profile}`, data);
//   }
// }

import { Injectable } from '@angular/core';
import { environment } from '../../../../../evironments/environment';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import {
  LeaveRequest,
  LeaveRequestHistory,
  LeaveRequestsResponse,
  LeaveTypes,
} from '../../../interface/employee';

const routes = {
  dashboard: 'Dashboard/user-stats',
  leaveTypes: 'LeaveTypes',
  leaveTypeById: 'LeaveTypeById',
  leaveRequests: 'LeaveRequests',
  leaveRequestById: 'LeaveRequestsById',
  profile: 'Profile',
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

  // Leave Requests
  createLeaveRequest(data: LeaveRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}${routes.leaveRequests}`, data);
  }

  getLeaveRequests(): Observable<LeaveRequestsResponse> {
    return this.http.get<LeaveRequestsResponse>(`${this.baseUrl}${routes.leaveRequests}`);
  }

  getLeaveRequestById(id: string): Observable<LeaveRequestHistory> {
    return this.http.get<LeaveRequestHistory>(`${this.baseUrl}${routes.leaveRequestById}/${id}`);
  }

  updateLeaveRequestById(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${routes.leaveRequestById}/${id}`, data);
  }

  deleteLeaveRequestById(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${routes.leaveRequestById}/${id}`);
  }

  // Profile
  getProfileDetails(): Observable<any> {
    return this.http.get(`${this.baseUrl}${routes.profile}`);
  }

  updateProfileDetails(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${routes.profile}`, data);
  }
}
