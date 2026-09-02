import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EmployeeSidebar } from '../../../shared/components/employee-sidebar/employee-sidebar';
import { MatIconModule } from '@angular/material/icon';
import { NotificationBell } from '../../../shared/components/notification-bell/notification-bell';

@Component({
  selector: 'app-employee-container',
  imports: [RouterOutlet, MatIconModule, EmployeeSidebar, NotificationBell],
  templateUrl: './employee-container.html',
  styles: ``,
})
export class EmployeeContainer {}


