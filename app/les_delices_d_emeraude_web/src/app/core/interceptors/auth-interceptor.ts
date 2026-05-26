import { HttpInterceptorFn } from '@angular/common/http';
import { Auth } from '../services/auth';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth : Auth = inject(Auth);
  return from(auth.getToken()).pipe(
      switchMap(token => {
        if (token) {
          req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
        }
        return next(req);
      })
    );
};
