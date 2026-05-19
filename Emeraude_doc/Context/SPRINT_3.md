# 🔧 Sprint 3 — Admin & Finitions

**Durée** : Semaine 5 (5 jours ouvrables)  
**Prérequis** : Sprint 1 et Sprint 2 terminés et validés.

---

## 🎯 Objectifs du sprint

À la fin du Sprint 3, l'application est production-ready :
1. L'admin peut gérer les produits, catégories et options via une interface dédiée
2. L'admin peut suivre et mettre à jour le statut des commandes
3. Les emails automatiques sont envoyés (confirmation + changements de statut)
4. Le site est responsive, accessible et testé end-to-end

---

## 📋 Tâches détaillées

---

### BLOC A — Backend Admin & Sécurité (Jours 1–2)

#### S3-01 — RolesGuard NestJS

**Responsable** : Développeur  
**Durée estimée** : 1h30

```typescript
// auth/roles.decorator.ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// auth/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user?.role);
  }
}
```

**Usage sur les routes admin** :
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController { ... }
```

**Résultat attendu** : Route admin avec un token de `customer` → 403. Avec un token d'`admin` → 200. Promouvoir un compte en admin via Supabase Studio : `UPDATE public.users SET role = 'admin' WHERE email = 'admin@test.com';`

---

#### S3-02 — AdminModule : CRUD Catégories

**Responsable** : Développeur  
**Durée estimée** : 1h30

**Routes** :
```
POST   /admin/categories         → CreateCategoryDto
PATCH  /admin/categories/:id     → UpdateCategoryDto (Partial)
DELETE /admin/categories/:id     → vérifier qu'aucun produit actif n'est lié
```

**Logique de suppression** :
```typescript
async deleteCategory(id: string) {
  const productCount = await this.productsRepo.count({
    where: { categoryId: id, isActive: true }
  });
  if (productCount > 0) {
    throw new BadRequestException(
      `Impossible de supprimer : ${productCount} produit(s) actif(s) dans cette catégorie.`
    );
  }
  await this.categoriesRepo.delete(id);
}
```

---

#### S3-03 — AdminModule : CRUD Produits + Upload Images

**Responsable** : Développeur  
**Durée estimée** : 3h

**Routes** :
```
POST   /admin/products                    → CreateProductDto
PATCH  /admin/products/:id                → UpdateProductDto
DELETE /admin/products/:id                → soft delete (is_active = false)
POST   /admin/products/:id/images         → upload vers Supabase Storage
```

**Upload image vers Supabase Storage** :
```typescript
// products.service.ts (admin)
async uploadImage(productId: string, file: Express.Multer.File): Promise<string> {
  const fileName = `products/${productId}/${Date.now()}-${file.originalname}`;
  const { data, error } = await this.supabase.storage
    .from('images')
    .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });
  
  if (error) throw new InternalServerErrorException('Upload échoué');
  
  const { data: { publicUrl } } = this.supabase.storage
    .from('images').getPublicUrl(data.path);
  
  return publicUrl;
}
```

**⚠️ Configurer dans Supabase** : Créer un bucket `images` (public), autoriser les types `image/jpeg`, `image/png`, `image/webp`. Taille max : 5 MB.

**Résultat attendu** : `POST /admin/products/:id/images` avec un fichier image → retourne l'URL publique Supabase.

---

#### S3-04 — AdminModule : CRUD Options & Valeurs

**Responsable** : Développeur  
**Durée estimée** : 2h

**Routes** :
```
POST   /admin/products/:productId/options  → CreateProductOptionDto
PATCH  /admin/options/:id                  → UpdateProductOptionDto
DELETE /admin/options/:id                  → ON DELETE CASCADE supprime les valeurs

POST   /admin/options/:optionId/values     → CreateOptionValueDto
PATCH  /admin/values/:id                   → UpdateOptionValueDto
DELETE /admin/values/:id
```

---

#### S3-05 — AdminModule : Gestion Commandes

**Responsable** : Développeur  
**Durée estimée** : 1h30

**Routes** :
```
GET   /admin/orders?status=pending&page=1&limit=20  → liste filtrée + paginée
PATCH /admin/orders/:id/status                       → UpdateOrderStatusDto
```

**À chaque changement de statut** : déclencher `EmailService.sendStatusUpdate(order)`.

---

#### S3-06 — AdminModule : Stats Dashboard

**Responsable** : Développeur  
**Durée estimée** : 1h30

**Route** : `GET /admin/stats`

**Réponse attendue** :
```json
{
  "todayOrders": 3,
  "monthRevenue": 425.50,
  "activeProducts": 18,
  "pendingOrders": 5,
  "last30DaysChart": [
    { "date": "2026-04-19", "count": 2, "revenue": 87.00 },
    ...
  ]
}
```

```sql
-- Requête SQL pour les stats
SELECT 
  COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) AS today_orders,
  COALESCE(SUM(total_price) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()) AND status != 'cancelled'), 0) AS month_revenue,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders
FROM orders;
```

---

### BLOC B — EmailModule Resend (Jour 2)

#### S3-07 — Email de confirmation de commande

**Responsable** : Développeur  
**Durée estimée** : 2h

**Installation** :
```bash
npm install resend
```

**Service email** :
```typescript
// email/email.service.ts
@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendOrderConfirmation(order: Order) {
    await this.resend.emails.send({
      from: 'La Pâtisserie <commandes@[votre-domaine.com]>',
      to: order.customerEmail,
      subject: `Confirmation de votre commande #${order.id.slice(0, 8).toUpperCase()}`,
      html: this.buildConfirmationTemplate(order)
    });
  }

  private buildConfirmationTemplate(order: Order): string {
    return `
      <h1>Merci pour votre commande ! 🍰</h1>
      <p>Bonjour ${order.customerName},</p>
      <p>Votre commande a bien été reçue et confirmée.</p>
      <h2>Récapitulatif</h2>
      ${order.items.map(item => `
        <div>
          <strong>${item.productName}</strong> × ${item.quantity} — ${item.lineTotal.toFixed(2)} $
          ${item.options.length > 0 ? `<br><small>${item.options.map(o => `${o.optionName}: ${o.value}`).join(', ')}</small>` : ''}
          ${item.comment ? `<br><em>Note: ${item.comment}</em>` : ''}
        </div>
      `).join('')}
      <p><strong>Total : ${order.totalPrice.toFixed(2)} $</strong></p>
    `;
  }
}
```

**Appel depuis le webhook Stripe** :
```typescript
// Dans OrdersService.markAsPaid()
await this.ordersRepo.update({ stripePaymentIntentId: intentId }, {
  status: 'confirmed', paidAt: new Date()
});
const order = await this.ordersRepo.findOne({ where: { stripePaymentIntentId: intentId }, relations: ['items', 'items.options'] });
await this.emailService.sendOrderConfirmation(order);
```

---

#### S3-08 — Email de changement de statut

**Responsable** : Développeur  
**Durée estimée** : 1h

**Appelé depuis** `AdminOrdersService.updateStatus()` à chaque `PATCH /admin/orders/:id/status`.

**Messages selon le statut** :
| Statut | Objet email | Message |
|--------|-------------|---------|
| `preparing` | "Votre commande est en préparation 👩‍🍳" | On prépare vos délices avec amour ! |
| `ready` | "Votre commande est prête ! 🎉" | Votre commande est prête à être récupérée. |
| `delivered` | "Commande livrée — Merci ! ❤️" | Bonne dégustation ! |
| `cancelled` | "Commande annulée" | Votre commande a été annulée. Contactez-nous pour plus d'infos. |

---

### BLOC C — Frontend Admin (Jours 2–4)

#### S3-09 — AdminLayoutComponent + S3-10 AdminGuard

**Responsable** : Développeur  
**Durée estimée** : 2h

**AdminGuard** :
```typescript
// core/guards/admin.guard.ts
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.currentUser$.pipe(
      take(1),
      map(user => {
        if (user?.role === 'admin') return true;
        this.router.navigate(['/']);
        return false;
      })
    );
  }
}
```

**AdminLayoutComponent** :
- Sidebar fixe (gauche) avec navigation :
  - 📊 Tableau de bord → `/admin`
  - 📦 Produits → `/admin/products`
  - 🏷️ Catégories → `/admin/categories`
  - 🛒 Commandes → `/admin/orders`
  - Bouton déconnexion
- Breadcrumb dynamique (basé sur la route active)
- Layout distinct du layout public

---

#### S3-11 — AdminDashboardPage

**Responsable** : Développeur  
**Durée estimée** : 2h

**Contenu** :
1. **KPIs** (4 cartes) :
   - Commandes aujourd'hui
   - Revenus du mois (en $)
   - Produits actifs
   - Commandes en attente
2. **Graphique barres** : commandes des 30 derniers jours (utiliser une lib légère type Chart.js ou ngx-charts)

---

#### S3-12 — AdminProductsPage

**Responsable** : Développeur  
**Durée estimée** : 6h (tâche la plus complexe)

**Tableau des produits** :
- Colonnes : image, nom, catégorie, prix, statut (actif/inactif), actions (éditer/désactiver)
- Tri et recherche côté client
- Bouton "Nouveau produit" → ouvrir le formulaire

**Formulaire produit** (dans un dialog ou une page dédiée) :
```
Onglet 1 — Informations de base :
  - Nom (requis)
  - Catégorie (select des catégories actives)
  - Prix de base (number, >= 0)
  - Description (textarea)
  - Mis en avant (checkbox)
  - Actif (checkbox)

Onglet 2 — Images :
  - Upload image principale (drag & drop ou browse)
  - Prévisualisation immédiate
  - Bouton "Supprimer" par image

Onglet 3 — Options de personnalisation :
  - Liste des options existantes avec bouton "Modifier" et "Supprimer"
  - Bouton "Ajouter une option" → sous-formulaire :
    - Nom de l'option (ex: Couleur)
    - Type (select/text/boolean)
    - Obligatoire (checkbox)
    - Si type = select : liste des valeurs avec price_modifier
      (interface drag-and-drop ou simple liste avec + et -)
```

**Résultat attendu** : Créer un produit complet avec options depuis l'interface admin. Le produit apparaît ensuite sur le catalogue public.

---

#### S3-13 — AdminCategoriesPage

**Responsable** : Développeur  
**Durée estimée** : 2h

**Tableau** : nom, slug, produits liés, ordre, actif, actions  
**Formulaire** (modal) : nom, slug (auto-généré depuis le nom), description, image, ordre, actif

**Résultat attendu** : CRUD catégories complet depuis l'interface.

---

#### S3-14 — AdminOrdersPage

**Responsable** : Développeur  
**Durée estimée** : 3h

**Liste des commandes** :
- Filtres par statut (tabs ou chips) : Toutes / En attente / Confirmées / En préparation / Prêtes / Livrées / Annulées
- Colonnes : date, client, email, total, statut, actions
- Clic sur "Voir détail" → vue détail dans le même écran (ou page séparée)

**Vue détail commande (admin)** :
- Toutes les infos de la commande
- Items avec options et **commentaires clients bien visibles** (mise en évidence visuelle)
- Dropdown de changement de statut + bouton "Confirmer"
- Confirmation avant changement (dialog "Êtes-vous sûr ?")

---

### BLOC D — Finalisation (Jour 5)

#### S3-15 — Tests manuels end-to-end

**Responsable** : Toute l'équipe  
**Durée estimée** : 3h

**Scénario 1 — Parcours client complet** :
1. Visiteur arrive sur la page d'accueil
2. Clique sur un produit vedette
3. Sélectionne les options (toutes les options obligatoires)
4. Ajoute au panier
5. Va dans le panier, modifie la quantité
6. Procède au checkout (sans compte)
7. Remplit le formulaire, paie avec la carte test Stripe
8. Vérifie la page de confirmation
9. Vérifie que la commande est en DB avec status `confirmed`

**Scénario 2 — Espace client** :
1. Se créer un compte
2. Passer une commande en étant connecté
3. Aller dans le dashboard → voir la commande
4. Voir le détail de la commande
5. Modifier le profil et sauvegarder

**Scénario 3 — Admin** :
1. Se connecter avec le compte admin
2. Créer une nouvelle catégorie
3. Créer un nouveau produit avec 2 options
4. Aller sur le catalogue → vérifier que le produit apparaît
5. Gérer une commande → la passer à `preparing`
6. Vérifier que l'email de changement de statut est reçu

---

#### S3-16 — Optimisation mobile

**Responsable** : Développeur  
**Durée estimée** : 2h

**Breakpoints Angular/SCSS** :
```scss
// styles/breakpoints.scss
$mobile:  480px;
$tablet:  768px;
$desktop: 1024px;

@mixin mobile { @media (max-width: #{$mobile}) { @content; } }
@mixin tablet { @media (max-width: #{$tablet}) { @content; } }
```

**Points à vérifier** :
- Grille produits : 3 colonnes (desktop) → 2 (tablette) → 1 (mobile)
- Header avec menu hamburger sur mobile
- Cart drawer pleine largeur sur mobile
- Formulaire checkout lisible sur petit écran
- Admin sidebar collapsible sur tablette

---

#### S3-17 — Accessibilité

**Responsable** : Développeur  
**Durée estimée** : 1h

**Checklist minimale** :
- [ ] Tous les `<img>` ont un `alt`
- [ ] Boutons ont des labels descriptifs (pas juste des icônes seules)
- [ ] Formulaires ont des `<label>` associés à leurs `<input>`
- [ ] Navigation au clavier fonctionne (Tab, Enter, Escape sur les modals)
- [ ] Contrastes de couleur suffisants (ratio min 4.5:1 pour le texte)
- [ ] Le cart drawer a un `aria-modal="true"` et un focus trap

---

#### S3-18 & S3-19 — Passage en production

**Responsable** : Chef de projet + Développeur  
**Durée estimée** : 2h

**Checklist production** :
- [ ] Remplacer les clés Stripe test (`sk_test_`, `pk_test_`) par les clés live (`sk_live_`, `pk_live_`)
- [ ] Configurer le webhook Stripe en live sur l'URL Railway
- [ ] Vérifier le domaine Resend (SPF, DKIM configurés)
- [ ] Activer la protection des branches GitHub (`main` requiert une PR)
- [ ] Vérifier que les variables d'environnement production sont correctes
- [ ] Faire un dernier build de production Angular (`ng build --configuration production`) et vérifier les bundle sizes
- [ ] Activer le monitoring Railway (alertes si le service tombe)

---

## ✅ Critères d'acceptation du Sprint 3

| Critère | Vérifié |
|---------|---------|
| Un compte admin peut accéder à `/admin` (un compte normal ne le peut pas) | ☐ |
| L'admin peut créer, modifier et désactiver un produit | ☐ |
| L'admin peut uploader une image → elle apparaît sur le produit | ☐ |
| L'admin peut ajouter une option avec des valeurs et price_modifiers | ☐ |
| L'admin peut changer le statut d'une commande | ☐ |
| Un email est reçu après confirmation de commande (Resend) | ☐ |
| Un email est reçu après chaque changement de statut | ☐ |
| Le site est utilisable sur mobile (responsive) | ☐ |
| Le scénario end-to-end complet fonctionne sans erreur | ☐ |
| Aucune clé secrète n'est visible côté client | ☐ |
| Les clés Stripe live sont configurées en production | ☐ |

---

## 🔗 Ordre d'exécution recommandé

```
Jour 1 : S3-01 (RolesGuard) → S3-02 (CRUD Catégories) → S3-03 (CRUD Produits + images)
Jour 2 : S3-04 (CRUD Options) → S3-05 (Commandes admin) → S3-06 (Stats)
         S3-07 (Email confirmation) → S3-08 (Email statuts)
Jour 3 : S3-09/10 (AdminLayout + Guard) → S3-11 (Dashboard admin) → S3-13 (Catégories admin)
Jour 4 : S3-12 (Produits admin — le plus complexe) → S3-14 (Commandes admin)
Jour 5 : S3-15 (Tests E2E) → S3-16 (Mobile) → S3-17 (A11y) → S3-18/19 (Prod)
```
