import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Employee } from '../../../core/services/data/employee/employee';
import { ProfileDetails } from '../../../core/interface/employee';
import { DatePipe, SlicePipe } from '@angular/common';

export interface Biodata {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  jobTitle: string;
  department: string;
  employeeId: string;
  startDate: any;
}

export interface Referee {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  occupation: string;
  relationship: string;
}

@Component({
  selector: 'app-profile',
  imports: [DatePipe],
  templateUrl: './profile.html',
  styles: ``,
})
export class Profile implements OnInit {
  profile: ProfileDetails = {
    id: '',
    fullName: '',
    email: '',
    role: '',
    department: '',
    designation: '',
    leaveBalance: 0,
    createdAt: 0,
  };

  constructor(
    private employeeService: Employee,
    private cdr: ChangeDetectorRef,
  ) {}

  // getFirstTwoCharacters(name: string): string {
  //   return name.charAt(0) + name.charAt(1);
  // }

   get userInitials(): string {
    const fullName = this.profile?.fullName ||'';
    if (!fullName) return 'U';

    const names = String(fullName).trim().split(/\s+/);
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.employeeService.getProfileDetails().subscribe({
      next: (response: any) => {
        console.log('Profile response:', response);

        const payload = response?.data ?? response;
        const profileData = payload?.data ?? payload?.profile ?? payload;

        this.profile = {
          ...this.profile,
          ...profileData,
          fullName: profileData?.fullName ?? profileData?.name ?? this.profile.fullName,
          leaveBalance:
            profileData?.leaveBalance ??
            profileData?.annualLeaveBalance ??
            this.profile.leaveBalance,
          designation:
            profileData?.designation ?? profileData?.jobTitle ?? this.profile.designation,
          createdAt: profileData?.createdAt ?? profileData?.startDate ?? this.profile.createdAt,
        } as ProfileDetails;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Profile API error:', error);
      },
    });
  }
}
