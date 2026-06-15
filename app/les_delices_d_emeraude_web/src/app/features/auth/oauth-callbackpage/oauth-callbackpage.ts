import { Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-oauth-callbackpage',
  imports: [],
  templateUrl: './oauth-callbackpage.html',
  styleUrl: './oauth-callbackpage.scss',
})
/*
// Petite page de rebond après OAuth Google (Supabase redirige ici)
// Ce composant lit la session depuis l'URL hash et navigue vers le dashboard.

// features/auth/pages/oauth-callback/oauth-callback.page.ts
*/
export class OAuthCallbackpage {private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // Supabase lit automatiquement le hash (#access_token=...) depuis l'URL
    // onAuthStateChange dans AuthService est notifié → _session est mis à jour
    // On attend juste que le statut soit résolu
    toObservable(this.auth.status)
      .pipe(filter(s => s !== 'loading'), take(1))
      .subscribe(status => {
        if (status === 'authenticated') {
          this.router.navigate(['/dashboard/orders']);
        } else {
          this.router.navigate(['/login']);
        }
      });
  }
}
