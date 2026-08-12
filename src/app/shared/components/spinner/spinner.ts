import { Component, inject } from '@angular/core';
import { Loader } from '../../../core/services/loader';


@Component({
  selector: 'app-spinner',
  imports: [],
  templateUrl: './spinner.html',
  styles: ``,
})
export class Spinner {
  protected loaderService = inject(Loader);
}
