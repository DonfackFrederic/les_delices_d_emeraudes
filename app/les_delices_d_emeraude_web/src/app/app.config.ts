import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

// ── Localisation française canadienne ────────────────────────────────────────
import { registerLocaleData } from '@angular/common';
import localeFrCa from '@angular/common/locales/fr-CA';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localeFrCa);  // à appeler une seule fois, au démarrage

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'fr-CA' },  // locale globale de l'app
  ],
};