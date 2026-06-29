import * as common from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { OrdersService } from 'src/orders/orders.service';

/**
 * Reçoit les webhooks Stripe.
 *
 * ⚠️ Nécessite que `rawBody: true` soit activé dans NestFactory.create()
 * (voir main.ts) — sinon `req.rawBody` est `undefined` et la vérification
 * de signature échoue systématiquement.
 *
 * Vit dans OrdersModule (pas StripeModule) : réagir au paiement pour
 * mettre à jour une commande est une responsabilité métier "Orders".
 */
@common.Controller('stripe')
export class StripeWebhookController {
  private readonly logger = new common.Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly ordersService: OrdersService,
  ) {}

  @common.Post('webhook')
  @common.HttpCode(200)
  async handleWebhook(
    @common.Req() req: common.RawBodyRequest<Request>,
    @common.Headers('stripe-signature') signature: string,
  ): Promise<{ received: true }> {
    if (!req.rawBody) {
      // Signe que rawBody:true n'est pas configuré dans main.ts —
      // erreur de config serveur, pas une requête Stripe invalide.
      this.logger.error(
        'req.rawBody est undefined — vérifier rawBody:true dans NestFactory.create()',
      );
      throw new common.BadRequestException('Configuration serveur invalide');
    }

    let event: Stripe.Event;
    try {
      event = this.stripeService.constructWebhookEvent(
        req.rawBody,
        signature,
      );
    } catch (err) {
      this.logger.warn(
        `Signature webhook invalide: ${(err as Error).message}`,
      );
      throw new common.BadRequestException('Signature webhook invalide');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.ordersService.markOrderAsPaid(paymentIntent.id);
        // L'envoi d'email de confirmation (Resend) arrive au Sprint 3
        // (S3-07) — markOrderAsPaid retourne déjà la commande complète,
        // prête à être branchée sur EmailService à ce moment-là.
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        this.logger.warn(
          `Paiement échoué pour PaymentIntent ${paymentIntent.id}`,
        );
        // Pas d'action DB nécessaire : la commande reste 'pending'.
        // Le client peut retenter le paiement avec le même clientSecret.
        break;
      }

      default:
        // On ignore silencieusement les autres types d'événements.
        // Évite de logger du bruit pour chaque event Stripe non pertinent.
        break;
    }

    return { received: true };
  }
}