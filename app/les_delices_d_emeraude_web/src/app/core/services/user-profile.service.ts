import { Injectable, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { User } from '@shared/types';import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
;

/**
 * Source unique du profil utilisateur complet (incluant le rôle), qui vit
 * dans public.users côté backend — jamais dans le JWT Supabase Auth
 * (cf. décision : pas de synchronisation du rôle côté client).
 *
 * Exposé en signal via httpResource : un seul appel réseau par session
 * (mise en cache implicite tant que le service n'est pas détruit — il est
 * providedIn: 'root', donc vit pour toute la durée de l'app), réutilisable
 * par la sidebar client, le login, le callback OAuth, etc.
 *
 * La requête ne se déclenche que si l'utilisateur est authentifié — cf.
 * la fonction réactive passée à httpResource, qui retourne `undefined`
 * (donc aucune requête) tant que ce n'est pas le cas.
 */
@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly auth = inject(AuthService);

  private readonly profileResource = httpResource<User>(() =>
    this.auth.isAuthenticated() ? `${environment.apiUrl}/users/me/profile` : undefined,
  );

  readonly profile = this.profileResource.value;
  readonly isLoading = this.profileResource.isLoading;

  readonly isAdmin = computed(() => this.profile()?.role === 'admin');

  /**
   * Force un rechargement — utile juste après connexion si on a besoin
   * immédiatement du rôle pour décider d'une redirection (le signal peut
   * ne pas encore être peuplé au moment exact de la vérification).
   */
  reload(): void {
    this.profileResource.reload();
  }

  /**
   * Variante Promise pour les cas où on a besoin de la valeur une seule
   * fois de façon impérative (ex: décider d'une redirection juste après
   * login, avant que le signal n'ait eu le temps de se stabiliser).
   */
  async fetchOnce(): Promise<User> {
    this.profileResource.reload();

    // Attend que la requête en cours se termine (isLoading passe à false)
    return new Promise((resolve, reject) => {
      const check = () => {
        if (this.profileResource.isLoading()) {
          setTimeout(check, 30);
          return;
        }
        const value = this.profileResource.value();
        const error = this.profileResource.error();
        if (error || !value) {
          reject(error ?? new Error('Profil introuvable'));
          return;
        }
        resolve(value);
      };
      check();
    });
  }
}