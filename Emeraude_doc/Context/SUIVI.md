# 📊 SUIVI.md — Tableau de bord Chef de Projet

> Mis à jour à chaque fin de journée ou de tâche complétée.

---

## État global du projet

| Sprint | Statut | Avancement | Date cible |
|--------|--------|------------|------------|
| Sprint 1 — Fondations & MVP | ⬜ À démarrer | 0% | Fin semaine 2 |
| Sprint 2 — Commandes & Personnalisation | ⬜ À démarrer | 0% | Fin semaine 4 |
| Sprint 3 — Admin & Finitions | ⬜ À démarrer | 0% | Fin semaine 5 |

**Légende** : ✅ Terminé · 🔄 En cours · ⬜ À démarrer · 🚫 Bloqué

---

## Sprint 1 — Suivi des tâches

### Setup & Infrastructure

| # | Tâche | Assigné | Statut | Notes |
|---|-------|---------|--------|-------|
| S1-01 | Créer repo GitHub (monorepo ou 2 repos) | — | ⬜ | |
| S1-02 | Initialiser projet NestJS | — | ⬜ | |
| S1-03 | Initialiser projet Angular 17 | — | ⬜ | |
| S1-04 | Créer projet Supabase | — | ⬜ | |
| S1-05 | Appliquer schéma SQL complet | — | ⬜ | |
| S1-06 | Configurer variables d'environnement (backend) | — | ⬜ | |
| S1-07 | Déployer backend sur Railway (env de staging) | — | ⬜ | |
| S1-08 | Déployer frontend sur Netlify (env de staging) | — | ⬜ | |

### Backend — Fondations

| # | Tâche | Assigné | Statut | Notes |
|---|-------|---------|--------|-------|
| S1-09 | AuthModule : JwtStrategy + JwtAuthGuard | — | ⬜ | |
| S1-10 | Trigger SQL : auth.users → public.users | — | ⬜ | |
| S1-11 | CategoriesModule : GET /categories, GET /categories/:slug | — | ⬜ | |
| S1-12 | ProductsModule : GET /products (avec filtres + pagination) | — | ⬜ | |
| S1-13 | ProductsModule : GET /products/:slug | — | ⬜ | |

### Frontend — Fondations

| # | Tâche | Assigné | Statut | Notes |
|---|-------|---------|--------|-------|
| S1-14 | Setup routing Angular + layouts | — | ⬜ | |
| S1-15 | AuthService Angular (Supabase client) | — | ⬜ | |
| S1-16 | HttpInterceptor (JWT Bearer) | — | ⬜ | |
| S1-17 | AuthGuard + pages Login/Register | — | ⬜ | |
| S1-18 | HomePageComponent (Hero + featured + catégories + how-it-works) | — | ⬜ | |
| S1-19 | ProductsPageComponent (liste + filtres + pagination) | — | ⬜ | |
| S1-20 | ProductDetailPageComponent (galerie + options + prix dynamique) | — | ⬜ | |

---

## Sprint 2 — Suivi des tâches

### Backend — Commandes

| # | Tâche | Assigné | Statut | Notes |
|---|-------|---------|--------|-------|
| S2-01 | OrdersModule : POST /orders/create-intent (validation prix serveur) | — | ⬜ | |
| S2-02 | StripeModule : PaymentIntent creation | — | ⬜ | |
| S2-03 | Webhook Stripe : payment_intent.succeeded | — | ⬜ | |
| S2-04 | GET /users/me/orders | — | ⬜ | |
| S2-05 | GET /users/me/orders/:id | — | ⬜ | |
| S2-06 | PATCH /users/me/profile | — | ⬜ | |

### Frontend — Panier & Checkout

| # | Tâche | Assigné | Statut | Notes |
|---|-------|---------|--------|-------|
| S2-07 | ProductOptionComponent (select, text, boolean) | — | ⬜ | |
| S2-08 | Calcul prix dynamique dans ProductDetailPage | — | ⬜ | |
| S2-09 | CartService (BehaviorSubject + localStorage) | — | ⬜ | |
| S2-10 | CartIconComponent (header badge) | — | ⬜ | |
| S2-11 | CartDrawerComponent (sidebar) | — | ⬜ | |
| S2-12 | CheckoutPageComponent + formulaire | — | ⬜ | |
| S2-13 | StripeService Angular (CardElement) | — | ⬜ | |
| S2-14 | Confirmation de paiement + navigation | — | ⬜ | |
| S2-15 | OrderConfirmationPageComponent | — | ⬜ | |
| S2-16 | DashboardLayoutComponent + OrdersListPage | — | ⬜ | |
| S2-17 | OrderDetailPageComponent (client) | — | ⬜ | |
| S2-18 | ProfilePageComponent | — | ⬜ | |

---

## Sprint 3 — Suivi des tâches

### Backend — Admin & Email

| # | Tâche | Assigné | Statut | Notes |
|---|-------|---------|--------|-------|
| S3-01 | RolesGuard NestJS (@Roles('admin')) | — | ⬜ | |
| S3-02 | AdminModule : CRUD Catégories | — | ⬜ | |
| S3-03 | AdminModule : CRUD Produits + upload images (Supabase Storage) | — | ⬜ | |
| S3-04 | AdminModule : CRUD Options & Valeurs | — | ⬜ | |
| S3-05 | AdminModule : Gestion commandes (liste filtrée + PATCH status) | — | ⬜ | |
| S3-06 | AdminModule : Stats dashboard (KPIs) | — | ⬜ | |
| S3-07 | EmailModule : confirmation de commande (Resend) | — | ⬜ | |
| S3-08 | EmailModule : changement de statut (Resend) | — | ⬜ | |

### Frontend — Admin

| # | Tâche | Assigné | Statut | Notes |
|---|-------|---------|--------|-------|
| S3-09 | AdminLayoutComponent (sidebar + breadcrumb) | — | ⬜ | |
| S3-10 | AdminGuard Angular | — | ⬜ | |
| S3-11 | AdminDashboardPage (KPIs + graphique) | — | ⬜ | |
| S3-12 | AdminProductsPage (tableau + formulaire + options) | — | ⬜ | |
| S3-13 | AdminCategoriesPage (CRUD) | — | ⬜ | |
| S3-14 | AdminOrdersPage (liste filtrée + détail + changement statut) | — | ⬜ | |

### Finalisation

| # | Tâche | Assigné | Statut | Notes |
|---|-------|---------|--------|-------|
| S3-15 | Tests manuels end-to-end complets | — | ⬜ | |
| S3-16 | Optimisation mobile (responsive) | — | ⬜ | |
| S3-17 | Accessibilité (aria-labels, contrastes) | — | ⬜ | |
| S3-18 | Passer Stripe en mode live (clés prod) | — | ⬜ | |
| S3-19 | Déploiement production final | — | ⬜ | |

---

## Journal des décisions (ADR)

| Date | Décision | Raison | Impact |
|------|----------|--------|--------|
| — | Pas de table SQL pour le panier | Simplicité, pas de sessions complexes | CartService 100% frontend (localStorage) |
| — | Snapshot des commandes (order_items) | Éviter la corruption si produits modifiés | Les prix/noms sont figés au moment de la commande |
| — | Soft delete pour les produits (is_active=false) | Préserver l'historique des commandes liées | Pas de DELETE SQL sur products |
| — | Validation prix côté serveur | Sécurité : ne jamais faire confiance au client | OrderService recalcule et rejette si écart > 0,01$ |

---

## Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|-----------|
| Délai intégration Stripe (webhooks en local) | Moyen | Haut | Utiliser Stripe CLI pour simuler les webhooks en dev |
| Complexité upload images Supabase Storage | Faible | Moyen | Prévoir tâche dédiée, tester en isolation |
| Surcharge Sprint 2 (beaucoup de tâches frontend) | Moyen | Moyen | Prioriser CartService + Checkout, CartDrawer peut venir après |
| Emails Resend non reçus (spam) | Faible | Faible | Tester avec adresses réelles, configurer SPF/DKIM |
