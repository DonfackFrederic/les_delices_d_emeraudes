import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Intercepteur de filet de sécurité : si une requête vers NOTRE backend
 * NestJS (pas vers Supabase directement) retourne 401, c'est que le token
 * envoyé est invalide ou expiré — peu importe pourquoi (refresh échoué,
 * session révoquée, bug de timing).
 *
 * Plutôt que de laisser l'utilisateur sur une page qui semble fonctionner
 * mais où toutes les requêtes échouent silencieusement, on force une
 * déconnexion propre + redirection.
 *
 * Ce filet est complémentaire à la réaction sur SIGNED_OUT dans AuthService :
 * il couvre aussi les cas où Supabase n'émettrait pas l'événement à temps,
 * ou des bugs de synchronisation connus côté supabase-js.
 */
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Ne réagit qu'aux appels vers NOTRE API, jamais vers Supabase Auth
  // directement (qui peut légitimement retourner 401 pour un login raté,
  // ce qui n'a rien à voir avec une session expirée).
  const isOwnApiCall = req.url.startsWith(environment.apiUrl);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        isOwnApiCall &&
        error instanceof HttpErrorResponse &&
        error.status === 401
      ) {
        // Déconnexion complète : nettoie la session Supabase locale
        // et redirige vers /login avec un indicateur pour afficher
        // un message clair à l'utilisateur.
        authService.signOut().then(() => {
          router.navigate(['/login'], {
            queryParams: { sessionExpired: 'true' },
          });
        });
      }

      return throwError(() => error);
    }),
  );
};