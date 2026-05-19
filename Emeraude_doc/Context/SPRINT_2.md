# 🛒 Sprint 2 — Commandes & Personnalisation

**Durée** : Semaines 3–4 (10 jours ouvrables)  
**Prérequis** : Sprint 1 terminé et validé. Compte Stripe créé (mode test).

---

## 🎯 Objectifs du sprint

À la fin du Sprint 2, on doit pouvoir :
1. Choisir les options d'un produit et voir le prix s'actualiser en temps réel
2. Ajouter des produits au panier (avec options et commentaire)
3. Voir et modifier son panier dans le drawer latéral
4. Passer une commande complète avec paiement Stripe (mode test)
5. Recevoir la confirmation de commande
6. Consulter son historique de commandes dans l'espace client

---

## 📋 Tâches détaillées

---

### BLOC A — Personnalisation Produit (Jours 1–2)

#### S2-07 — ProductOptionComponent

**Responsable** : Développeur  
**Durée estimée** : 3h

**Comportement** : Composant générique qui reçoit un `ProductOption` en `@Input()` et émet un `@Output() selectionChange: EventEmitter<SelectedOption>`.

```typescript
// shared/interfaces/product.interface.ts
export interface SelectedOption {
  optionId: string;
  optionName: string;
  value: string;
  priceModifier: number;
}
```

**3 sous-types à implémenter** :

**Type `select`** :
- Afficher en radio buttons ou `<select>`
- Afficher le `price_modifier` à côté de chaque choix (+2,50 $ ou -)
- Si `isRequired: true`, griser le bouton "Ajouter au panier" si rien n'est sélectionné

**Type `text`** :
- Champ `<input type="text">` libre
- Max 200 caractères
- Émet `priceModifier: 0`

**Type `boolean`** :
- Checkbox
- Si cochée → émet `{ value: 'Oui', priceModifier }`
- Afficher clairement le surcoût si applicable

**Résultat attendu** : Les 3 types s'affichent correctement dans la page détail produit. Chaque changement émet l'événement correctement.

---

#### S2-08 — Calcul prix dynamique

**Responsable** : Développeur  
**Durée estimée** : 1h30

**Logique à implémenter dans `ProductDetailPageComponent`** :

```typescript
// Dans ProductDetailPageComponent
selectedOptions: SelectedOption[] = [];
quantity = 1;

get currentPrice(): number {
  const optionsTotal = this.selectedOptions.reduce(
    (sum, opt) => sum + opt.priceModifier, 0
  );
  return (this.product.basePrice + optionsTotal) * this.quantity;
}

onOptionChange(option: SelectedOption) {
  const idx = this.selectedOptions.findIndex(o => o.optionId === option.optionId);
  if (idx >= 0) {
    this.selectedOptions[idx] = option;
  } else {
    this.selectedOptions.push(option);
  }
}
```

**Animation** : Transition CSS de 300ms sur le changement de prix (classe CSS `price-updated` ajoutée/retirée).

**Résultat attendu** : Changer une option met à jour le prix affiché instantanément avec une légère animation. Changer la quantité met aussi à jour le total.

---

### BLOC B — CartService & Panier (Jours 2–4)

#### S2-09 — CartService Angular

**Responsable** : Développeur  
**Durée estimée** : 2h

```typescript
// core/services/cart.service.ts
export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions: SelectedOption[];
  comment: string;
  lineTotal: number; // calculé : (basePrice + sum options) × qty
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private STORAGE_KEY = 'patisserie_cart';
  private cartSubject = new BehaviorSubject<CartItem[]>(this.loadFromStorage());
  
  cart$ = this.cartSubject.asObservable();
  total$ = this.cart$.pipe(
    map(items => items.reduce((sum, item) => sum + item.lineTotal, 0))
  );
  itemCount$ = this.cart$.pipe(
    map(items => items.reduce((sum, item) => sum + item.quantity, 0))
  );

  addItem(product: Product, quantity: number, selectedOptions: SelectedOption[], comment: string) {
    const optionsTotal = selectedOptions.reduce((s, o) => s + o.priceModifier, 0);
    const lineTotal = (product.basePrice + optionsTotal) * quantity;
    const newItem: CartItem = { product, quantity, selectedOptions, comment, lineTotal };
    const current = this.cartSubject.getValue();
    this.cartSubject.next([...current, newItem]);
    this.saveToStorage();
  }

  updateQuantity(index: number, quantity: number) {
    const items = [...this.cartSubject.getValue()];
    if (quantity <= 0) { this.removeItem(index); return; }
    const item = items[index];
    const optionsTotal = item.selectedOptions.reduce((s, o) => s + o.priceModifier, 0);
    items[index] = { ...item, quantity, lineTotal: (item.product.basePrice + optionsTotal) * quantity };
    this.cartSubject.next(items);
    this.saveToStorage();
  }

  removeItem(index: number) {
    const items = this.cartSubject.getValue().filter((_, i) => i !== index);
    this.cartSubject.next(items);
    this.saveToStorage();
  }

  clearCart() {
    this.cartSubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private loadFromStorage(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch { return []; }
  }

  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cartSubject.getValue()));
  }
}
```

**Résultat attendu** : `addItem` depuis la page produit ajoute au panier. Recharger la page → le panier est persisté (localStorage).

---

#### S2-10 — CartIconComponent (Header)

**Responsable** : Développeur  
**Durée estimée** : 1h

**Comportement** :
- Icône panier (SVG ou icône lib)
- Badge avec le nombre total d'items (s'affiche uniquement si > 0)
- Animation de "bounce" quand un item est ajouté
- Clic → ouvre/ferme le `CartDrawerComponent`

**Résultat attendu** : Le badge se met à jour immédiatement après `addItem`. Toujours visible dans le header.

---

#### S2-11 — CartDrawerComponent

**Responsable** : Développeur  
**Durée estimée** : 3h

**UI à implémenter** :
- Sidebar overlay (slide depuis la droite, fond semi-transparent)
- Liste des `CartItem` avec :
  - Image du produit (miniature)
  - Nom du produit
  - Options choisies (liste compacte)
  - Commentaire (si non vide)
  - Contrôles de quantité (- / quantité / +)
  - Bouton supprimer (corbeille)
  - Prix de la ligne
- Total général en bas
- Bouton "Passer la commande" → naviguer vers `/checkout`
- Bouton "Continuer mes achats" → fermer le drawer

**Résultat attendu** : Drawer s'ouvre/ferme correctement. Modifier la quantité depuis le drawer met à jour le total. Panier vide → message "Votre panier est vide".

---

### BLOC C — Checkout & Stripe (Jours 4–7)

#### S2-12 — CheckoutPageComponent

**Responsable** : Développeur  
**Durée estimée** : 3h

**Formulaire réactif Angular** :
```typescript
checkoutForm = this.fb.group({
  customerName: ['', [Validators.required, Validators.minLength(2)]],
  customerEmail: ['', [Validators.required, Validators.email]],
  customerPhone: [''],
  deliveryNotes: ['', Validators.maxLength(500)]
});
```

- Si l'utilisateur est connecté → pré-remplir `name` et `email` depuis `AuthService`
- Afficher le récapitulatif des items (readonly, depuis `CartService`)
- Total final mis en évidence
- Section paiement Stripe (CardElement ici)
- Bouton "Confirmer et payer" → désactivé si formulaire invalide ou paiement en cours

**Résultat attendu** : Formulaire validé visuellement. Les erreurs s'affichent champ par champ.

---

#### S2-01 — OrdersModule Backend : POST /orders/create-intent

**Responsable** : Développeur  
**Durée estimée** : 3h

**Logique critique (validation serveur)** :
```typescript
// orders.service.ts
async createOrder(dto: CreateOrderDto, userId?: string): Promise<CreateIntentResponse> {
  // 1. Pour chaque item, recharger le produit et ses options depuis la DB
  let calculatedTotal = 0;
  for (const item of dto.items) {
    const product = await this.productsRepo.findOne({ where: { id: item.productId }, relations: ['options', 'options.values'] });
    if (!product || !product.isActive) throw new BadRequestException(`Produit ${item.productId} indisponible`);
    
    let itemPrice = Number(product.basePrice);
    for (const opt of item.selectedOptions) {
      const value = product.options
        .flatMap(o => o.values)
        .find(v => v.id === opt.valueId);
      if (value) itemPrice += Number(value.priceModifier);
    }
    calculatedTotal += itemPrice * item.quantity;
  }

  // 2. Rejeter si écart > 0,01$
  if (Math.abs(calculatedTotal - dto.expectedTotal) > 0.01) {
    throw new BadRequestException('Prix incohérent. Veuillez recharger la page.');
  }

  // 3. Créer la commande en DB (status: pending)
  const order = await this.ordersRepo.save({ ...dto, userId, totalPrice: calculatedTotal, status: 'pending' });

  // 4. Créer le PaymentIntent Stripe
  const paymentIntent = await this.stripe.paymentIntents.create({
    amount: Math.round(calculatedTotal * 100), // en centimes
    currency: 'cad',
    metadata: { orderId: order.id }
  });

  // 5. Sauvegarder le stripe_payment_intent_id
  await this.ordersRepo.update(order.id, { stripePaymentIntentId: paymentIntent.id });

  return { orderId: order.id, clientSecret: paymentIntent.client_secret };
}
```

**Résultat attendu** :
- `POST /orders/create-intent` avec un total correct → retourne `{ orderId, clientSecret }`
- Avec un total manipulé → retourne 400

---

#### S2-13 & S2-14 — StripeService Angular + Confirmation paiement

**Responsable** : Développeur  
**Durée estimée** : 3h

```typescript
// core/services/stripe.service.ts
@Injectable({ providedIn: 'root' })
export class StripeService {
  private stripePromise = loadStripe(environment.stripePublishableKey);
  private cardElement: StripeCardElement | null = null;

  async mountCardElement(elementId: string) {
    const stripe = await this.stripePromise;
    const elements = stripe!.elements();
    this.cardElement = elements.create('card', {
      style: { base: { fontSize: '16px', color: '#424770' } }
    });
    this.cardElement.mount(`#${elementId}`);
    return this.cardElement;
  }

  async confirmPayment(clientSecret: string): Promise<{ success: boolean; error?: string }> {
    const stripe = await this.stripePromise;
    const { error } = await stripe!.confirmCardPayment(clientSecret, {
      payment_method: { card: this.cardElement! }
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }
}
```

**Flux de paiement complet** :
1. Utilisateur clique "Confirmer et payer"
2. `POST /orders/create-intent` → `{ orderId, clientSecret }`
3. `stripe.confirmCardPayment(clientSecret)` avec la carte de test Stripe
4. Si succès → naviguer vers `/order-confirmation/:orderId`
5. Si erreur → afficher le message d'erreur Stripe sous le formulaire

**Carte de test Stripe** : `4242 4242 4242 4242`, expiry: n'importe quelle date future, CVC: n'importe quel 3 chiffres.

---

#### S2-02 & S2-03 — StripeModule Backend : Webhook

**Responsable** : Développeur  
**Durée estimée** : 2h

```typescript
// stripe/stripe.controller.ts
@Post('webhook')
@HttpCode(200)
async handleWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
  const event = this.stripe.webhooks.constructEvent(
    req.rawBody, // IMPORTANT : rawBody, pas le body parsé
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    await this.ordersService.markAsPaid(paymentIntent.id);
  }

  return { received: true };
}
```

**⚠️ Important** : Configurer NestJS pour exposer le `rawBody` sur la route webhook (nécessaire pour la vérification de signature Stripe) :
```typescript
// main.ts
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));
```

**Test en local** : Utiliser Stripe CLI :
```bash
stripe listen --forward-to localhost:3000/stripe/webhook
stripe trigger payment_intent.succeeded
```

**Résultat attendu** : Après paiement test, `orders.status` passe à `confirmed` et `paid_at` est renseigné.

---

#### S2-15 — OrderConfirmationPageComponent

**Responsable** : Développeur  
**Durée estimée** : 1h

**Afficher** :
- Message de confirmation (succès ou erreur)
- Numéro de commande
- Récapitulatif des items
- Bouton "Retour à l'accueil"
- Vider le panier (`CartService.clearCart()`) après confirmation

---

### BLOC D — Espace Client (Jours 8–10)

#### S2-04 & S2-05 — Backend : routes /users/me

**Responsable** : Développeur  
**Durée estimée** : 1h30

```typescript
// Toutes protégées par @UseGuards(JwtAuthGuard)
GET  /users/me/orders       → liste triée par created_at DESC (avec items)
GET  /users/me/orders/:id   → détail (vérifier user_id === req.user.id, sinon 403)
PATCH /users/me/profile     → mettre à jour full_name et phone uniquement
```

---

#### S2-16, S2-17, S2-18 — Espace Client Frontend

**Responsable** : Développeur  
**Durée estimée** : 4h

**DashboardLayoutComponent** :
- Header avec nom de l'utilisateur + bouton déconnexion
- Liens de navigation : Mes commandes / Mon profil

**OrdersListPageComponent** :
- Tableau : date, statut (badge coloré), total, lien "Voir détail"
- Couleurs des statuts :
  - `pending` → gris
  - `confirmed` → bleu
  - `preparing` → orange
  - `ready` → vert clair
  - `delivered` → vert foncé
  - `cancelled` → rouge

**OrderDetailPageComponent** :
- Infos de la commande (date, statut, total)
- Chaque item : image, nom, options, commentaire, quantité, sous-total
- Timeline de statut (progression visuelle)
- Bouton "Retour"

**ProfilePageComponent** :
- Formulaire pré-rempli (nom, téléphone)
- Bouton "Sauvegarder" → `PATCH /users/me/profile`
- Toast de confirmation après sauvegarde

---

## ✅ Critères d'acceptation du Sprint 2

| Critère | Vérifié |
|---------|---------|
| Choisir une option de type `select` met à jour le prix affiché | ☐ |
| Choisir une option de type `text` ou `boolean` fonctionne | ☐ |
| "Ajouter au panier" ajoute l'item avec les options choisies | ☐ |
| Le badge de l'icône panier se met à jour en temps réel | ☐ |
| Le drawer panier liste tous les items avec leurs options | ☐ |
| Modifier la quantité dans le drawer met à jour le total | ☐ |
| La page Checkout est pré-remplie si l'utilisateur est connecté | ☐ |
| Paiement Stripe avec la carte de test `4242...` réussit | ☐ |
| La commande passe de `pending` à `confirmed` après le webhook | ☐ |
| La page de confirmation s'affiche et le panier est vidé | ☐ |
| L'espace client liste les commandes de l'utilisateur connecté | ☐ |
| Accéder à la commande d'un autre utilisateur retourne 403 | ☐ |

---

## 🔗 Ordre d'exécution recommandé

```
Jour 1  : S2-07 (ProductOptionComponent — 3 types)
Jour 2  : S2-08 (calcul prix) → S2-09 (CartService)
Jour 3  : S2-10 (CartIcon) → S2-11 (CartDrawer)
Jour 4  : S2-12 (CheckoutPage — formulaire)
Jour 5  : S2-01 (Backend OrdersModule create-intent)
Jour 6  : S2-02/03 (StripeModule backend webhook)
Jour 7  : S2-13/14 (StripeService Angular + confirmation paiement)
Jour 8  : S2-15 (OrderConfirmationPage) → S2-04/05 (Backend /users/me)
Jour 9  : S2-16/17/18 (Espace client frontend)
Jour 10 : Tests d'acceptation complets + correction bugs
```
