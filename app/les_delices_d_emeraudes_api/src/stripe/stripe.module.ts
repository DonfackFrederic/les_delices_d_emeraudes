import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';

/**
 * Module Stripe "bas niveau" : expose uniquement StripeService
 * (création de PaymentIntent, vérification de signature webhook).
 *
 * Le controller qui REÇOIT le webhook vit dans OrdersModule
 * (StripeWebhookController) car la réaction à l'événement
 * payment_intent.succeeded est une responsabilité métier "commande",
 * pas une responsabilité "Stripe". Ça évite aussi une dépendance
 * circulaire StripeModule <-> OrdersModule.
 */
@Module({
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}