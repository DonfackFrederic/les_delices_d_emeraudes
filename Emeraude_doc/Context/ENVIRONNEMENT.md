# ⚙️ ENVIRONNEMENT.md — Variables d'environnement & Déploiement

> ⚠️ Ne jamais commiter les valeurs réelles. Ce fichier documente les noms et descriptions uniquement.

---

## Backend — `.env` (Railway)

```env
# ─── Base de données ────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres

# ─── Supabase ───────────────────────────────────────────────────
SUPABASE_URL=https://[REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Settings > API > service_role (jamais exposée côté client)
SUPABASE_JWT_SECRET=...             # Settings > API > JWT Secret (pour valider les tokens)

# ─── Stripe ─────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...       # sk_live_... en production
STRIPE_WEBHOOK_SECRET=whsec_...     # Stripe CLI ou Dashboard Webhooks

# ─── Resend ─────────────────────────────────────────────────────
RESEND_API_KEY=re_...

# ─── CORS ───────────────────────────────────────────────────────
FRONTEND_URL=https://[votre-app].netlify.app   # URL Netlify de production

# ─── App ────────────────────────────────────────────────────────
NODE_ENV=production
PORT=3000
```

---

## Frontend — `environment.ts` (Angular)

```typescript
// src/environments/environment.ts (développement)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  supabaseUrl: 'https://[REF].supabase.co',
  supabaseAnonKey: 'eyJ...',           // Settings > API > anon (publique, sans danger)
  stripePublishableKey: 'pk_test_...'  // pk_live_... en production
};

// src/environments/environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: 'https://[votre-app].railway.app',
  supabaseUrl: 'https://[REF].supabase.co',
  supabaseAnonKey: 'eyJ...',
  stripePublishableKey: 'pk_live_...'
};
```

**⚠️ Note Netlify** : Injecter les variables via les Netlify Environment Variables et les lire au build avec `@ngx-env/builder` ou en configurant `angular.json` pour les remplacer au build.

---

## Récupération des clés — Guide étape par étape

### Supabase
1. [app.supabase.com](https://app.supabase.com) → votre projet → **Settings** → **API**
2. `Project URL` → `SUPABASE_URL`
3. `anon` key → `SUPABASE_ANON_KEY` (frontend)
4. `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (backend uniquement)
5. `JWT Secret` (Settings → API → JWT Settings) → `SUPABASE_JWT_SECRET`
6. **Settings** → **Database** → Connection string (URI) → `DATABASE_URL`

### Stripe
1. [dashboard.stripe.com](https://dashboard.stripe.com) → Développeurs → **Clés API**
2. Clé publiable (`pk_test_...`) → `STRIPE_PUBLISHABLE_KEY` (frontend)
3. Clé secrète (`sk_test_...`) → `STRIPE_SECRET_KEY` (backend)
4. Pour le webhook secret : Développeurs → **Webhooks** → Ajouter un endpoint
   - URL : `https://[votre-railway-url]/stripe/webhook`
   - Événements : `payment_intent.succeeded`
   - Copier le **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

### Resend
1. [resend.com](https://resend.com) → **API Keys** → Create API Key
2. Copier la clé → `RESEND_API_KEY`
3. **Domains** → Ajouter votre domaine → Configurer SPF et DKIM

---

## Configuration NestJS pour le rawBody (Stripe webhook)

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Nécessaire pour la vérification de signature Stripe
  });
  
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  
  const config = new DocumentBuilder()
    .setTitle('Pâtisserie API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));
  
  await app.listen(process.env.PORT || 3000);
}
```

---

## Netlify — Fichier `_redirects`

Créer `frontend/public/_redirects` :
```
/* /index.html 200
```
Nécessaire pour que le routing Angular (SPA) fonctionne sur Netlify (évite les 404 sur F5).

---

## Railway — `railway.toml`

Créer `backend/railway.toml` :
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node dist/main"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

Et ajouter un endpoint de health check dans NestJS :
```typescript
// app.controller.ts
@Get('health')
health() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```
