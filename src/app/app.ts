import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader } from './core/services/loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  
  protected readonly title = signal('NewLeaveManagementSystem');
  protected loaderService = inject(Loader);
}
