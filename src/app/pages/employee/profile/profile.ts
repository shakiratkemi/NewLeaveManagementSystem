import { Component, OnInit } from '@angular/core';
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
  profile!: ProfileDetails;

  constructor(private employeeService: Employee) {}

  getFirstTwoCharacters(name: string): string {
    return name.charAt(0) + name.charAt(1);
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.employeeService.getProfileDetails().subscribe({
      next: (response: any) => {
        console.log('Profile response:', response);

        this.profile = response.data ?? response;
      },

      error: (error) => {
        console.error('Profile API error:', error);
      },
    });
  }
}
