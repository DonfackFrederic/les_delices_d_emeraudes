# 🏛️ ARCHITECTURE.md — Décisions techniques & Conventions

---

## 1. Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└─────────────┬──────────────────────────────┬────────────────────┘
              │                              │
    ┌─────────▼─────────┐        ┌──────────▼──────────┐
    │   Angular 17       │        │     NestJS           │
    │   (Netlify)        │◄──────►│     (Railway)        │
    │   Port 4200/CDN   │  HTTP  │     Port 3000        │
    └─────────┬─────────┘        └──────────┬──────────┘
              │                             │
              │                   ┌─────────▼──────────┐
              │                   │   Supabase          │
              └──────────────────►│   - PostgreSQL      │
                  (Supabase JS)   │   - Auth (JWT)      │
                                  │   - Storage         │
                                  └────────────────────┘
                                           │
                             ┌─────────────┼─────────────┐
                             ▼             ▼             ▼
                          Stripe         Resend      (futur)
                         (paiement)     (emails)
```

---

## 2. Décisions d'architecture (ADRs)

### ADR-001 : Pas de table SQL pour le panier
**Décision** : Le panier est géré 100% côté frontend (localStorage + BehaviorSubject Angular).  
**Raison** : Simplicité, pas de sessions server-side, pas d'API nécessaire pour chaque modification du panier.  
**Conséquence** : Le panier est perdu si l'utilisateur vide son localStorage. Acceptable pour ce type de service (commandes sur mesure, délai de réalisation).

### ADR-002 : Snapshot des commandes
**Décision** : `order_items` et `order_item_options` contiennent des copies des données produit au moment de la commande.  
**Raison** : Un produit peut être modifié ou supprimé après une commande. L'historique doit rester cohérent.  
**Conséquence** : `product_id` dans `order_items` est nullable (NULL si produit supprimé depuis).

### ADR-003 : Soft delete pour les produits
**Décision** : `DELETE /admin/products/:id` met `is_active = false`, ne supprime pas la ligne.  
**Raison** : Des commandes peuvent référencer ce produit. La suppression physique briserait les foreign keys ou les snapshots.  
**Conséquence** : Les produits inactifs n'apparaissent pas côté client mais restent en base.

### ADR-004 : Validation du prix côté serveur
**Décision** : `OrdersService.createOrder()` recalcule entièrement le prix depuis la DB et rejette si écart > 0,01$.  
**Raison** : Un client malveillant pourrait envoyer des prix modifiés depuis le frontend.  
**Conséquence** : Latence légèrement plus haute pour la création de commande, mais sécurité garantie.

### ADR-005 : JWT Supabase pour l'authentification
**Décision** : Supabase Auth génère les JWT. NestJS les valide via le `JwtStrategy` sans gérer de session propre.  
**Raison** : Déléguer l'auth à Supabase évite de gérer les refresh tokens, la réinitialisation de mot de passe, etc.  
**Conséquence** : Le `SUPABASE_JWT_SECRET` doit être identique entre Supabase et NestJS. Récupérer dans Settings > API > JWT Secret.

---

## 3. Conventions de code

### Backend NestJS

**Nommage des fichiers** :
```
categories/
├── categories.module.ts
├── categories.controller.ts
├── categories.service.ts
├── entities/
│   └── category.entity.ts
└── dto/
    ├── create-category.dto.ts
    └── update-category.dto.ts
```

**Nommage TypeORM → JSON** : Utiliser `@Column({ name: 'is_active' })` pour le snake_case SQL, les propriétés TypeScript restent en camelCase. Configurer le serializer NestJS pour retourner du camelCase.

**Gestion des erreurs** : Utiliser les exceptions NestJS (`NotFoundException`, `BadRequestException`, `ForbiddenException`). Ne pas attraper les erreurs TypeORM génériques sans les transformer.

**Variables d'environnement** : Toujours via `ConfigService`, jamais `process.env.X` directement dans les services (sauf `main.ts`).

### Frontend Angular

**Structure des composants standalone** :
```typescript
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // préféré pour les composants purs
})
```

**Services** : Toujours `providedIn: 'root'`. Les BehaviorSubject sont privés, exposer uniquement les Observables publics.

**Interfaces TypeScript** : Définies dans `shared/interfaces/`. Utiliser les mêmes noms que les DTOs backend (synchronisation manuelle pour l'instant, librairie partagée en évolution future).

**Gestion des erreurs HTTP** : Intercepteur global qui catche les 401 (logout), les 403 (redirect), et affiche un toast générique pour les 500.

---

## 4. Sécurité

| Point | Mesure |
|-------|--------|
| Clés secrètes | Jamais dans le code source. Variables d'environnement uniquement. |
| SUPABASE_SERVICE_ROLE_KEY | Backend uniquement. Jamais exposée côté frontend. |
| STRIPE_SECRET_KEY | Backend uniquement. |
| Prix | Recalculés côté serveur. Le frontend envoie `expectedTotal` uniquement pour UX (comparaison). |
| Admin routes | Protégées par `JwtAuthGuard` + `RolesGuard` côté backend ET `AdminGuard` côté frontend. |
| Webhook Stripe | Signature vérifiée à chaque requête avec `STRIPE_WEBHOOK_SECRET`. |
| Upload images | Validation du type MIME et de la taille côté backend avant upload Supabase. |
| CORS | Backend configuré pour accepter uniquement l'URL du frontend (variable `FRONTEND_URL`). |

---

## 5. Performance

- **Categories** : Mise en cache frontend avec `shareReplay(1)` (changent rarement).
- **Products** : Pagination côté backend (12 par page). Pas de "load all".
- **Images** : Supabase Storage + CDN. Penser à compresser les images avant upload (côté admin).
- **Angular** : Lazy loading des modules admin et dashboard (chargés uniquement si besoin).
- **Change Detection** : `OnPush` sur les composants purement "display" (`ProductCardComponent`, etc.).
