import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentIntentParams, CreatePaymentIntentResult } from 'src/types/stripe.types';
import Stripe from 'stripe';

/**
 * Wrapper bas-niveau autour du SDK Stripe.
 * Ne contient AUCUNE logique métier (pas de notion de "commande") :
 * c'est OrdersService qui orchestre. Ce service ne sait parler que Stripe.
 */
@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY manquante dans les variables d\'environnement');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2026-05-27.dahlia',
    });
  }

  /**
   * Crée un PaymentIntent Stripe.
   * `amount` est exprimé en unité monétaire principale (ex: 42.50) et converti
   * en centimes ici — le reste de l'app ne doit jamais manipuler de centimes.
   */
  async createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<CreatePaymentIntentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100),
        currency: params.currency,
        metadata: params.metadata,
        automatic_payment_methods: { enabled: true },
      });

      if (!paymentIntent.client_secret) {
        throw new InternalServerErrorException(
          'Stripe n\'a pas retourné de client_secret',
        );
      }

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException(
        `Échec de la création du PaymentIntent Stripe: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Vérifie la signature du webhook et reconstruit l'événement Stripe.
   * `rawBody` DOIT être le buffer brut de la requête (non parsé en JSON).
   */
  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new Error(
        'STRIPE_WEBHOOK_SECRET manquante dans les variables d\'environnement',
      );
    }

    // Lance Stripe.errors.StripeSignatureVerificationError si invalide —
    // laissé tel quel, le controller le traduit en 400.
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  }
}