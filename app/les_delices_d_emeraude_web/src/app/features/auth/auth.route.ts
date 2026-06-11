import { Routes } from '@angular/router';
import { redirectIfAuthenticatedGuard } from '../../core/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./loginpage/loginpage').then((m) => m.Loginpage),
    canActivate: [redirectIfAuthenticatedGuard],
    title: 'Connexion — Les Délices d\'Émeraude',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./registerpage/registerpage').then((m) => m.Registerpage),
    canActivate: [redirectIfAuthenticatedGuard],
    title: 'Créer un compte — Les Délices d\'Émeraude',
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./oauth-callbackpage/oauth-callbackpage').then(
        (m) => m.OAuthCallbackpage,
      ),
    title: 'Connexion en cours…',
  },
  // {
  //   path: 'auth/forgot-password',
  //   loadComponent: () =>
  //     import('./pages/forgot-password/forgot-password.page').then(
  //       (m) => m.ForgotPasswordPageComponent,
  //     ),
  //   title: 'Mot de passe oublié — Les Délices d\'Émeraude',
  // },
];