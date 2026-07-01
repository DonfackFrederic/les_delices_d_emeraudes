// features/auth/services/auth.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, Session, User, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
  );

  // ─── State (Signals) ────────────────────────────────────────────────────────
  private readonly _session = signal<Session | null>(null);
  private readonly _status = signal<AuthStatus>('loading');

  readonly session = this._session.asReadonly();
  readonly status = this._status.asReadonly();
  readonly currentUser = computed(() => this._session()?.user ?? null);
  readonly isAuthenticated = computed(() => this._status() === 'authenticated');
  readonly isLoading = computed(() => this._status() === 'loading');
  readonly userInitials = computed(() => {
  const user = this._session()?.user ?? null;
  const name: string = user?.user_metadata?.['full_name'] ?? user?.email ?? '';
    return name
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  readonly userDisplayName = computed(() => {
    const user = this._session()?.user ?? null;
    return user?.user_metadata?.['full_name'] ?? user?.email ?? '';
  });

  // 1. Dans le constructor, remplacer onAuthStateChange par une version qui
//    distingue explicitement l'événement et redirige sur SIGNED_OUT.
 
  constructor() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session.set(data.session);
      this._status.set(data.session ? 'authenticated' : 'unauthenticated');
    });
 
    this.supabase.auth.onAuthStateChange((event, session) => {
      this._session.set(session);
      this._status.set(session ? 'authenticated' : 'unauthenticated');
 
      // ── Cas critique : la session est devenue invalide ──────────────────
      // SIGNED_OUT est émis par Supabase quand :
      // - l'utilisateur se déconnecte volontairement
      // - le refresh token a expiré ou a été révoqué (cas qui nous intéresse ici)
      // - une session a été invalidée depuis un autre appareil
      //
      // Dans tous ces cas, on force une redirection propre vers /login
      // pour éviter que l'utilisateur reste sur une page qui semble
      // fonctionnelle mais dont toutes les requêtes API échoueront en 401.
      if (event === 'SIGNED_OUT') {
        // Évite de rediriger en boucle si on est déjà sur une page publique
        const protectedPrefixes = ['/dashboard', '/checkout', '/admin'];
        const isOnProtectedRoute = protectedPrefixes.some((prefix) =>
          this.router.url.startsWith(prefix),
        );
 
        if (isOnProtectedRoute) {
          this.router.navigate(['/login'], {
            queryParams: { sessionExpired: 'true' },
          });
        }
      }
    });
  }

  // ─── Email / Password ───────────────────────────────────────────────────────
  async signInWithEmail(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: this.translateError(error.message) };
    return { error: null };
  }

  async signUpWithEmail(
    email: string,
    password: string,
    fullName: string,
  ): Promise<{ error: string | null }> {
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: this.translateError(error.message) };
    return { error: null };
  }

  // ─── OAuth Google ───────────────────────────────────────────────────────────
  async signInWithGoogle(): Promise<{ error: string | null }> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { error: this.translateError(error.message) };
    return { error: null };
  }

  // ─── Mot de passe oublié ────────────────────────────────────────────────────
  async resetPassword(email: string): Promise<{ error: string | null }> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) return { error: this.translateError(error.message) };
    return { error: null };
  }

  // ─── Déconnexion ────────────────────────────────────────────────────────────
  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this._session.set(null);
    this._status.set('unauthenticated');
    this.router.navigate(['/']);
  }

  // ─── Token pour les requêtes NestJS ────────────────────────────────────────
  /**
   * Retourne le token d'accès courant, en interrogeant TOUJOURS Supabase
   * directement plutôt que de se fier au signal local _session.
   *
   * Pourquoi : _session est mis à jour de façon asynchrone par
   * onAuthStateChange. Il existe une fenêtre de temps (généralement
   * quelques dizaines de ms, mais pas garantie) où le statut local affiche
   * déjà 'authenticated' alors que getSession() interne à supabase-js n'a
   * pas fini de persister/relire le token depuis le storage.
   *
   * En interrogeant systématiquement supabase.auth.getSession() (qui lit
   * l'état réel, pas notre copie locale), on élimine cette classe de bug
   * à la racine — plus besoin de patcher chaque page d'entrée (login,
   * callback OAuth, refresh manuel, etc.) une par une.
   *
   * Le retry léger couvre le cas extrême où getSession() lui-même
   * retournerait momentanément null pendant l'écriture du storage
   * (rare, mais déjà observé dans des issues connues de supabase-js).
   */
  async getAccessToken(): Promise<string | null> {
    const { data } = await this.supabase.auth.getSession();
  
    if (data.session?.access_token) {
      return data.session.access_token;
    }
  
    // Pas de token immédiatement disponible alors qu'on s'attendrait à en
    // avoir un (ex: juste après un login) — un seul retry après un court
    // délai, pour laisser le temps au storage de se stabiliser.
    if (this._status() === 'authenticated') {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const { data: retryData } = await this.supabase.auth.getSession();
      return retryData.session?.access_token ?? null;
    }
  
    return null;
  }

  // ─── Traduction des erreurs Supabase → français ─────────────────────────────
  private translateError(message: string): string {
    const map: Record<string, string> = {
      'Invalid login credentials': 'Email ou mot de passe incorrect.',
      'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter.',
      'User already registered': 'Un compte existe déjà avec cet email.',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
      'Signup requires a valid password': 'Veuillez entrer un mot de passe valide.',
      'Unable to validate email address: invalid format': 'Format d\'email invalide.',
    };
    return map[message] ?? 'Une erreur est survenue. Veuillez réessayer.';
  }
}