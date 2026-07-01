import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

// ── Localisation française canadienne ────────────────────────────────────────
import { registerLocaleData } from '@angular/common';
import localeFrCa from '@angular/common/locales/fr-CA';
import { LOCALE_ID } from '@angular/core';
import { authErrorInterceptor } from './core/interceptors/auth-error.interceptor';
import { authInterceptor } from './core/interceptors/auth-interceptor';

registerLocaleData(localeFrCa);  // à appeler une seule fois, au démarrage

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, authErrorInterceptor])
    ),
    { provide: LOCALE_ID, useValue: 'fr-CA' },  // locale globale de l'app
  ],
};