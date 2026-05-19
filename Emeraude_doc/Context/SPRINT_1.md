# 🏗️ Sprint 1 — Fondations & MVP

**Durée** : Semaines 1–2 (10 jours ouvrables)  
**Objectif** : Application déployée et accessible, catalogue produits fonctionnel, authentification opérationnelle.

---

## 🎯 Objectifs du sprint

À la fin du Sprint 1, on doit pouvoir :
1. Visiter le site en production (Netlify + Railway)
2. Voir la page d'accueil avec les produits en vedette
3. Parcourir le catalogue avec filtres par catégorie
4. Voir le détail d'un produit avec ses options
5. Se créer un compte et se connecter
6. Les routes protégées redirigent vers `/login` si non connecté

---

## 📋 Tâches détaillées

---

### BLOC A — Setup & Infrastructure (Jour 1)

#### S1-01 — Créer le repository GitHub

**Responsable** : Chef de projet  
**Durée estimée** : 30 min

**Instructions** :
```bash
# Option recommandée : monorepo avec 2 dossiers
mkdir patisserie-platform
cd patisserie-platform
git init

# Structure :
# patisserie-platform/
# ├── backend/    ← NestJS
# ├── frontend/   ← Angular
# └── docs/       ← Ce dossier de planification
```

**Résultat attendu** : Repo GitHub créé, `.gitignore` configuré pour Node/Angular, branche `main` + `develop` créées.

---

#### S1-02 — Initialiser le projet NestJS

**Responsable** : Développeur  
**Durée estimée** : 1h

**Instructions** :
```bash
cd backend
npm i -g @nestjs/cli
nest new . --package-manager npm

# Installer les dépendances clés du projet
npm install @nestjs/config @nestjs/typeorm typeorm pg
npm install @supabase/supabase-js
npm install @nestjs/passport passport passport-jwt
npm install class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express
```

**Structure cible** :
```
backend/src/
├── app.module.ts
├── main.ts
├── config/
├── auth/
├── users/
├── categories/
├── products/
├── orders/
├── stripe/
├── email/
└── admin/
```

**Résultat attendu** : `npm run start:dev` fonctionne sur `localhost:3000`. Swagger accessible sur `/api`.

---

#### S1-03 — Initialiser le projet Angular 17

**Responsable** : Développeur  
**Durée estimée** : 1h

**Instructions** :
```bash
cd frontend
npm i -g @angular/cli
ng new . --routing --style=scss --standalone

# Installer les dépendances clés
npm install @supabase/supabase-js
npm install @stripe/stripe-js
```

**Structure cible** :
```
frontend/src/app/
├── core/
│   ├── guards/
│   ├── interceptors/
│   └── services/
├── shared/
│   ├── components/
│   └── interfaces/
├── features/
│   ├── home/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── auth/
│   ├── dashboard/
│   └── admin/
└── app.routes.ts
```

**Résultat attendu** : `ng serve` fonctionne sur `localhost:4200`. App Angular vide s'affiche.

---

#### S1-04 — Créer le projet Supabase

**Responsable** : Chef de projet  
**Durée estimée** : 30 min

**Instructions** :
1. Aller sur [supabase.com](https://supabase.com) → New Project
2. Nommer le projet `patisserie-platform`
3. Choisir région : **Canada (East)** ou **US East** (le plus proche)
4. Récupérer et noter dans un fichier `.env.local` (jamais commité) :
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL` (format : `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`)

**Résultat attendu** : Projet Supabase actif. Variables d'environnement notées.

---

#### S1-05 — Appliquer le schéma SQL complet

**Responsable** : Développeur  
**Durée estimée** : 1h30

**Instructions** : Exécuter dans l'éditeur SQL de Supabase (dans l'ordre) :

```sql
-- 1. Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Fonction updated_at générique
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Table users (extension de auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- 4. Trigger : peupler public.users depuis auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Table categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_timestamp_categories BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- 6. Table products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_timestamp_products BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- 7. Table product_options
CREATE TABLE public.product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('select', 'text', 'boolean')),
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Table product_option_values
CREATE TABLE public.product_option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID NOT NULL REFERENCES public.product_options(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  price_modifier NUMERIC(10,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

-- 9. Table orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','preparing','ready','delivered','cancelled')),
  total_price NUMERIC(10,2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  delivery_notes TEXT,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_timestamp_orders BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- 10. Table order_items (snapshot)
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_image_url TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  line_total NUMERIC(10,2) NOT NULL,
  comment TEXT
);

-- 11. Table order_item_options (snapshot)
CREATE TABLE public.order_item_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  option_name TEXT NOT NULL,
  value TEXT NOT NULL,
  price_modifier NUMERIC(10,2) NOT NULL DEFAULT 0
);
```

**Résultat attendu** : Toutes les tables visibles dans Supabase Studio. Trigger `on_auth_user_created` actif. Créer un compte de test → vérifier que `public.users` est peuplé.

---

### BLOC B — Backend Fondations (Jours 2–4)

#### S1-09 — AuthModule : JwtStrategy + JwtAuthGuard

**Responsable** : Développeur  
**Durée estimée** : 2h

**Instructions** :

```typescript
// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Supabase signe ses JWT avec un secret interne — on valide via l'API
      secretOrKey: process.env.SUPABASE_JWT_SECRET, // Settings > API > JWT Secret
    });
  }

  async validate(payload: any) {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', payload.sub)
      .single();

    if (error || !user) throw new UnauthorizedException();
    return user; // injecté dans req.user
  }
}
```

```typescript
// src/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**Résultat attendu** : Décorer une route avec `@UseGuards(JwtAuthGuard)` retourne 401 sans token valide, 200 avec.

---

#### S1-11 — CategoriesModule

**Responsable** : Développeur  
**Durée estimée** : 2h

**Routes à implémenter** :
- `GET /categories` → toutes les catégories actives, triées par `sort_order`
- `GET /categories/:slug` → une catégorie par slug (404 si inexistante ou inactive)

**Résultat attendu** :
```json
// GET /categories
[
  {
    "id": "uuid",
    "name": "Pâtisserie",
    "slug": "patisserie",
    "description": "...",
    "imageUrl": "...",
    "sortOrder": 0,
    "isActive": true
  }
]
```

---

#### S1-12 & S1-13 — ProductsModule

**Responsable** : Développeur  
**Durée estimée** : 3h

**Routes à implémenter** :
- `GET /products?category=slug&featured=true&search=mot&page=1&limit=12`
- `GET /products/:slug` (avec options et valeurs en eager loading)

**Résultat attendu** :
```json
// GET /products?featured=true&limit=6
{
  "data": [ /* tableau de Product avec category + options */ ],
  "total": 12,
  "page": 1,
  "limit": 6
}
```

```json
// GET /products/macaron-vanille
{
  "id": "uuid",
  "name": "Macaron Vanille",
  "slug": "macaron-vanille",
  "basePrice": 18.50,
  "options": [
    {
      "id": "uuid",
      "name": "Couleur",
      "type": "select",
      "isRequired": true,
      "values": [
        { "id": "uuid", "value": "Rose", "priceModifier": 0 },
        { "id": "uuid", "value": "Doré", "priceModifier": 2.50 }
      ]
    }
  ]
}
```

---

### BLOC C — Frontend Fondations (Jours 3–8)

#### S1-14 — Setup routing Angular + layouts

**Responsable** : Développeur  
**Durée estimée** : 2h

**Routes à configurer** :
```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'products', component: ProductsPageComponent },
  { path: 'products/:slug', component: ProductDetailPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    component: DashboardLayoutComponent,
    children: [
      { path: 'orders', component: OrdersListPageComponent },
      { path: 'orders/:id', component: OrderDetailPageComponent },
      { path: 'profile', component: ProfilePageComponent },
    ]
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    component: AdminLayoutComponent,
    children: [ /* Sprint 3 */ ]
  },
  { path: '**', redirectTo: '' }
];
```

**Résultat attendu** : Navigation entre les pages fonctionne. Layouts `PublicLayoutComponent` (header + footer) appliqué aux routes publiques.

---

#### S1-15 — AuthService Angular

**Responsable** : Développeur  
**Durée estimée** : 2h

```typescript
// core/services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
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
```

**Résultat attendu** : `signIn` fonctionne avec un compte Supabase de test. `session$` émet la session après connexion.

---

#### S1-16 — HttpInterceptor (JWT Bearer)

**Responsable** : Développeur  
**Durée estimée** : 1h

```typescript
// core/interceptors/auth.interceptor.ts
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.auth.getToken()).pipe(
      switchMap(token => {
        if (token) {
          req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
        }
        return next.handle(req);
      })
    );
  }
}
```

**Résultat attendu** : Toutes les requêtes `HttpClient` vers le backend incluent automatiquement `Authorization: Bearer <token>`.

---

#### S1-18 — HomePageComponent

**Responsable** : Développeur  
**Durée estimée** : 4h

**Sections à implémenter** :
1. **HeroComponent** : image plein écran, slogan, 2 boutons CTA avec animation entrée
2. **FeaturedProductsComponent** : `GET /products?featured=true&limit=6`, grille 3→2→1 colonnes
3. **CategoriesSectionComponent** : `GET /categories`, cards cliquables
4. **HowItWorksComponent** : 3 étapes statiques avec icônes SVG

**Résultat attendu** : Page d'accueil visuellement complète et responsive. Les produits vedettes et catégories sont chargés depuis l'API réelle.

---

#### S1-19 — ProductsPageComponent

**Responsable** : Développeur  
**Durée estimée** : 3h

**Comportement attendu** :
- Chips de filtres par catégorie (actives selon l'URL `?category=slug`)
- Barre de recherche (debounce 300ms)
- Grille de `ProductCardComponent`
- Pagination (12 produits par page)
- Les filtres se synchronisent avec les query params de l'URL (navigation back/forward fonctionne)

**Résultat attendu** : Filtrer par catégorie met à jour l'URL et recharge les produits. La pagination fonctionne.

---

#### S1-20 — ProductDetailPageComponent

**Responsable** : Développeur  
**Durée estimée** : 3h

**Comportement attendu** :
- Chargement du produit via `GET /products/:slug`
- Galerie d'images (image principale + miniatures)
- Rendu des options (`ProductOptionComponent` — les types complets viennent au Sprint 2, afficher au moins les selects)
- Prix calculé dynamiquement (base + sum des price_modifiers)
- Bouton "Ajouter au panier" (le CartService vient au Sprint 2 — afficher un `alert()` ou toast pour l'instant)

**Résultat attendu** : La page se charge depuis un slug réel. Le prix s'affiche correctement.

---

### BLOC D — Déploiement (Jour 9)

#### S1-07 — Déployer backend sur Railway

**Instructions** :
1. Créer un compte sur [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo → sélectionner le dossier `backend/`
3. Ajouter les variables d'environnement (depuis `8. Variables d'environnement`)
4. Vérifier que `GET https://[url-railway]/categories` répond

**Résultat attendu** : API backend accessible en HTTPS sur Railway. CORS configuré pour accepter l'URL Netlify.

---

#### S1-08 — Déployer frontend sur Netlify

**Instructions** :
1. Créer un compte sur [netlify.com](https://netlify.com)
2. New site → Import from GitHub → sélectionner le dossier `frontend/`
3. Build command : `ng build --configuration production`
4. Publish directory : `dist/[nom-projet]/browser`
5. Ajouter les variables d'environnement (`apiUrl` = URL Railway, `supabaseUrl`, etc.)
6. Ajouter un fichier `frontend/public/_redirects` : `/* /index.html 200` (SPA routing)

**Résultat attendu** : Site accessible en HTTPS sur Netlify. Navigation entre pages fonctionne (pas de 404 sur F5).

---

## ✅ Critères d'acceptation du Sprint 1

| Critère | Vérifié |
|---------|---------|
| Site accessible en production (Netlify) | ☐ |
| API backend accessible (Railway) | ☐ |
| Page d'accueil avec Hero + produits vedettes + catégories | ☐ |
| Liste produits avec filtres par catégorie fonctionnels | ☐ |
| Page détail produit chargée depuis l'API | ☐ |
| Inscription d'un compte réussie | ☐ |
| Connexion / Déconnexion fonctionnelles | ☐ |
| Route `/dashboard` protégée (redirige si non connecté) | ☐ |
| Routes `/categories` et `/products` de l'API répondent correctement | ☐ |
| Aucune clé secrète dans le code source commité | ☐ |

---

## 🔗 Dépendances et ordre d'exécution recommandé

```
Jour 1 : S1-01 → S1-02 → S1-03 → S1-04 → S1-05
Jour 2 : S1-06 → S1-09 → S1-10
Jour 3 : S1-11 → S1-14 → S1-15
Jour 4 : S1-12 → S1-13 → S1-16 → S1-17
Jour 5 : S1-18 (HomePage)
Jour 6 : S1-19 (ProductsPage)
Jour 7 : S1-20 (ProductDetailPage)
Jour 8 : Buffer / finitions / debug
Jour 9 : S1-07 → S1-08 (déploiement)
Jour 10 : Tests d'acceptation + correction bugs
```
