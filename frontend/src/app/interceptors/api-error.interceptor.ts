import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

/**
 * Global API error handling: network failures and server (5xx) errors are
 * surfaced as toasts. Business errors (4xx) bubble up to the calling
 * component, which decides how to present them (dialog, inline, toast).
 */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 0) {
        toast.error('Cannot reach the server. Please make sure the backend is running.');
      } else if (err.status >= 500) {
        toast.error(err.error?.message || 'Unexpected server error. Please try again.');
      }
      return throwError(() => err);
    })
  );
};
