import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Protège les routes /admin/*.
 *
 * Ce guard vérifie UNIQUEMENT que l'utilisateur est authentifié — il ne
 * vérifie pas le rôle admin côté frontend. La vraie barrière de sécurité
 * est RolesGuard côté NestJS (Sprint 3, S3-01), qui retourne 403 sur
 * chaque route /admin/* si req.user.role !== 'admin'.
 *
 * Pourquoi ce choix : le rôle vit dans public.users (source de vérité),
 * pas dans le JWT/session Supabase Auth. Dupliquer cette donnée côté
 * client ajoute de la complexité et un délai de propagation pour un
 * bénéfice purement cosmétique — le backend refusera de toute façon
 * l'accès aux données si le rôle ne correspond pas.
 *
 * Un utilisateur non-admin authentifié qui accède à /admin verra donc les
 * pages se charger, mais chaque appel API échouera en 403 — les pages
 * admin gèrent cet état via httpResource.error().
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.status).pipe(
    filter((status) => status !== 'loading'),
    take(1),
    map((status) => {
      if (status !== 'authenticated') {
        return router.createUrlTree(['/login']);
      }
      return true;
    }),
  );
};