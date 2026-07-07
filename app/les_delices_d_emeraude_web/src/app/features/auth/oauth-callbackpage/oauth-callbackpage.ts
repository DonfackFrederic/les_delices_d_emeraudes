import { Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfileService } from '../../../core/services/user-profile.service';

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
export class OAuthCallbackpage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private userProfileService = inject(UserProfileService); // ← nouveau
 
  constructor() {
    toObservable(this.auth.status)
      .pipe(filter(s => s !== 'loading'), take(1))
      .subscribe(async (status) => {
        if (status !== 'authenticated') {
          this.router.navigate(['/login']);
          return;
        }
 
        // Même logique de redirection par rôle que Loginpage —
        // à terme, si ce pattern se répète encore, envisager un
        // AuthRedirectService partagé plutôt que de dupliquer.
        try {
          const destination = this.userProfileService.isAdmin() ? '/admin' : '/dashboard/orders';
          console.log('OAuthCallbackpage : redirection vers', destination);
          console.log('OAuthCallbackpage : userProfileService.isAdmin() =', this.userProfileService.isAdmin());
          this.router.navigate([destination]);
        } catch {
          this.router.navigate(['/dashboard/orders']);
        }
      });
  }
}
