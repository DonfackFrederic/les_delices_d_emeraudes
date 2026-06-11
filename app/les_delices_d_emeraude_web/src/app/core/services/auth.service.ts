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

  constructor() {
    // Restaurer la session existante au démarrage de l'app
    this.supabase.auth.getSession().then(({ data }) => {
      this._session.set(data.session);
      this._status.set(data.session ? 'authenticated' : 'unauthenticated');
    });

    // Écouter les changements d'état (login, logout, token refresh)
    this.supabase.auth.onAuthStateChange((_, session) => {
      this._session.set(session);
      this._status.set(session ? 'authenticated' : 'unauthenticated');
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
  async getAccessToken(): Promise<string | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session?.access_token ?? null;
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