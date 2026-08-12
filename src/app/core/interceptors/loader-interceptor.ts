import { HttpInterceptorFn } from '@angular/common/http';
import { Loader } from '../services/loader';
import { finalize } from 'rxjs/internal/operators/finalize';
import { inject } from '@angular/core/primitives/di';
import { timeout } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(Loader);
  loaderService.show();

  return next(req).pipe(
    timeout(30000),
    finalize(() => {
      loaderService.hide();
    }),
  );
};
