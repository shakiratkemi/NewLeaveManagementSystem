import { Component } from '@angular/core';

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
  imports: [],
  templateUrl: './profile.html',
  styles: ``,
})
export class Profile {
  userProfile: Biodata = {
    name: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    phoneNumber: '+1 (555) 019-2834',
    address: '2233 Sunrise Road, Suite 400, Austin, TX 78701',
    jobTitle: 'Senior UI/UX Engineer',
    department: 'Engineering',
    employeeId: 'EMP-4082',
    startDate: '2026-01-15',
  };
  referees: Referee[] = [
    {
      name: 'Sarah Connor',
      email: 's.connor@techcorp.com',
      phoneNumber: '+1 (555) 888-1234',
      address: '100 Innovation Way, San Jose, CA',
      occupation: 'Engineering Director',
      relationship: 'Former Manager',
    },
    {
      name: 'David Miller',
      email: 'dmiller@designstudio.io',
      phoneNumber: '+1 (555) 777-5678',
      address: '45 Creative Blvd, New York, NY',
      occupation: 'Lead Product Designer',
      relationship: 'Professional Mentor',
    },
  ];
}
