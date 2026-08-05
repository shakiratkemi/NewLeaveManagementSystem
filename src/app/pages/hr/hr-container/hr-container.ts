import { Component } from '@angular/core';
import { HrSidebar } from '../../../shared/components/hr-sidebar/hr-sidebar';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hr-container',
  imports: [HrSidebar, RouterOutlet,MatIconModule],
  templateUrl: './hr-container.html',
  styles: ``,
})
export class HrContainer {}
