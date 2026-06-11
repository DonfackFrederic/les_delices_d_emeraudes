// features/auth/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

/**
 * Redirige vers /login si l'utilisateur n'est pas connecté.
 * Attend la fin du chargement de session avant de décider.
 */
export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.status).pipe(
    filter((status) => status !== 'loading'),
    take(1),
    map((status) => {
      if (status === 'authenticated') return true;
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: route.url.join('/') },
      });
    }),
  );
};

/**
 * Redirige vers /dashboard si l'utilisateur est déjà connecté.
 * Utilisé sur /login et /register pour éviter de les afficher inutilement.
 */
export const redirectIfAuthenticatedGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.status).pipe(
    filter((status) => status !== 'loading'),
    take(1),
    map((status) => {
      if (status === 'unauthenticated') return true;
      return router.createUrlTree(['/dashboard/orders']);
    }),
  );
};