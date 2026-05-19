# 🍰 Plateforme E-Commerce Pâtisserie — Dossier Chef de Projet

> **Version** : 1.0 | **Démarrage** : Mai 2026 | **Durée** : 5 semaines (3 sprints)

---

## Vue d'ensemble du projet

Plateforme web e-commerce permettant à une pâtissière de proposer ses créations avec un système de commande personnalisé. L'architecture est conçue pour être évolutive (pâtisserie, bouchées salées, livrets personnalisés sur la même plateforme).

---

## Stack technique

| Couche | Technologie | Hébergement | Coût estimé |
|--------|-------------|-------------|-------------|
| Frontend | Angular 17 | Netlify | Gratuit |
| Backend | NestJS | Railway | ~5$/mois |
| Base de données | PostgreSQL | Supabase | Gratuit (500 MB) |
| Auth | Supabase Auth | (inclus) | Gratuit |
| Paiement | Stripe | — | % par transaction |
| Emails | Resend | — | Gratuit (3 000/mois) |

---

## Structure du dossier projet

```
projet-patisserie/
├── README.md                        ← Ce fichier (vue d'ensemble)
├── ARCHITECTURE.md                  ← Décisions techniques et conventions
├── SUIVI.md                         ← Tableau de bord du chef de projet
│
├── sprints/
│   ├── SPRINT_1.md                  ← Fondations & MVP (semaines 1-2)
│   ├── SPRINT_2.md                  ← Commandes & Personnalisation (semaines 3-4)
│   └── SPRINT_3.md                  ← Admin & Finitions (semaine 5)
│
└── architecture/
    ├── DATABASE.md                  ← Schéma SQL complet commenté
    ├── BACKEND.md                   ← Structure NestJS, modules, DTOs
    ├── FRONTEND.md                  ← Structure Angular, routes, services
    └── ENVIRONNEMENT.md             ← Variables d'environnement et déploiement
```

---

## Roadmap des sprints

```
SEMAINE 1-2 ▓▓▓▓▓▓▓▓░░░░░░░░░░░░  Sprint 1 — Fondations & MVP
SEMAINE 3-4 ░░░░░░░░▓▓▓▓▓▓▓▓░░░░  Sprint 2 — Commandes & Personnalisation
SEMAINE 5   ░░░░░░░░░░░░░░░░▓▓▓▓  Sprint 3 — Admin & Finitions
```

### Sprint 1 — Fondations & MVP
- Setup projets NestJS + Angular
- Supabase (DB, Auth, Storage) + schéma SQL complet
- Backend : CategoriesModule + ProductsModule (lecture) + AuthModule
- Frontend : navigation, accueil, catalogue, détail produit, auth

### Sprint 2 — Commandes & Personnalisation
- Composants options + calcul prix dynamique
- CartService + CartDrawer + Checkout
- OrdersModule backend + validation serveur
- Intégration Stripe complète + webhook
- Espace client (dashboard)

### Sprint 3 — Admin & Finitions
- AdminModule + RolesGuard backend
- CRUD produits/catégories/options admin (frontend)
- Gestion commandes + changements de statut
- EmailModule Resend
- Tests, optimisation mobile, accessibilité

---

## Conventions de travail

### Nomenclature commits
```
feat(module): description courte
fix(module): description courte
chore: description courte
docs: description courte
```

### Branches Git
```
main          ← production (protégée)
develop       ← intégration continue
sprint/1      ← sprint en cours
feat/nom      ← feature branches
```

### Définition of Done (DoD)
Une tâche est "Done" quand :
- [ ] Le code est écrit et fonctionne localement
- [ ] Les cas d'erreur sont gérés (400, 401, 403, 404, 500)
- [ ] Testé manuellement (backend : via Postman/Thunder ; frontend : dans le navigateur)
- [ ] Pas de `console.log` de debug restants
- [ ] Mergé dans `develop` sans conflit

---

## Contacts et rôles

| Rôle | Responsabilité |
|------|---------------|
| Chef de projet / Architecte | Planification, revue technique, arbitrages |
| Développeur(s) | Implémentation feature par feature |

---

## Liens utiles (à remplir à la création des projets)

- Repo GitHub : `_________________`
- Supabase project URL : `_________________`
- Netlify URL : `_________________`
- Railway URL : `_________________`
- Stripe Dashboard : `_________________`
