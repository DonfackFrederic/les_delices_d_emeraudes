import { Injectable } from '@angular/core';
import { createClient, Session } from '@supabase/supabase-js';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  private sessionSubject = new BehaviorSubject<Session | null>(null);
  
  session$ = this.sessionSubject.asObservable();
  currentUser$ = this.session$.pipe(map(s => s?.user ?? null));
  isAuthenticated$ = this.session$.pipe(map(s => !!s));

  constructor() {
    // Restaurer la session au démarrage
    this.supabase.auth.getSession().then(({ data }) => {
      this.sessionSubject.next(data.session);
    });
    this.supabase.auth.onAuthStateChange((_, session) => {
      this.sessionSubject.next(session);
    });
  }

  async signUp(email: string, password: string, fullName: string) {
    return this.supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    });
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.sessionSubject.next(null);
  }

  async getToken(): Promise<string | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }
  
}
