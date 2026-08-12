import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Spinner } from "./shared/components/spinner/spinner";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Spinner],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  
  protected readonly title = signal('NewLeaveManagementSystem');
 
}
