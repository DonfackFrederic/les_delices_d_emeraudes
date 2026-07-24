import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { Order, OrderStatus } from '@shared/types';
import { buildOrderConfirmationTemplate } from './templates/order-confirmation.template';
import {
  buildStatusUpdateTemplate,
  getStatusEmailSubject,
} from './templates/status-update.template';

/**
 * Service d'envoi d'emails via Resend.
 *
 * Principe important : un échec d'envoi d'email ne doit JAMAIS faire échouer
 * l'opération métier qui l'a déclenché (confirmation de paiement, changement
 * de statut). Chaque méthode publique attrape ses propres erreurs, les logue,
 * et retourne silencieusement — l'appelant n'a pas à gérer d'exception email.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY manquante dans les variables d\'environnement');
    }
    this.resend = new Resend(apiKey);

    // Domaine de test Resend par défaut — remplacer par un domaine vérifié
    // (ex: commandes@tondomaine.com) une fois le DNS SPF/DKIM configuré.
    this.fromAddress = this.configService.get<string>('EMAIL_FROM_ADDRESS')
      ?? 'La Pâtisserie <onboarding@resend.dev>';
  }

  /**
   * Envoie l'email de confirmation après paiement réussi.
   * Appelé depuis le webhook Stripe (OrdersService.markOrderAsPaid).
   */
  async sendOrderConfirmation(order: Order): Promise<void> {
    try {
      const { error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: order.customerEmail,
        subject: `Confirmation de votre commande #${order.id.slice(0, 8).toUpperCase()}`,
        html: buildOrderConfirmationTemplate(order),
      });

      if (error) {
        this.logger.error(
          `Échec envoi email confirmation commande ${order.id}`,
          error,
        );
        return;
      }

      this.logger.log(`Email de confirmation envoyé pour la commande ${order.id}`);
    } catch (err) {
      this.logger.error(
        `Exception lors de l'envoi de l'email de confirmation (commande ${order.id})`,
        err,
      );
    }
  }

  /**
   * Envoie un email de changement de statut.
   * Appelé depuis AdminOrdersService.updateStatus().
   * Ne fait rien (silencieusement) si le statut ne déclenche pas d'email
   * (ex: pending, confirmed — cf. table dans status-update.template.ts).
   */
  async sendStatusUpdate(order: Order, status: OrderStatus): Promise<void> {
    const subject = getStatusEmailSubject(status);
    const html = buildStatusUpdateTemplate(order, status);

    if (!subject || !html) {
      // Statut sans email associé (pending, confirmed) — comportement normal.
      return;
    }

    try {
      const { error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: order.customerEmail,
        subject,
        html,
      });

      if (error) {
        this.logger.error(
          `Échec envoi email statut "${status}" pour commande ${order.id}`,
          error,
        );
        return;
      }

      this.logger.log(
        `Email de statut "${status}" envoyé pour la commande ${order.id}`,
      );
    } catch (err) {
      this.logger.error(
        `Exception lors de l'envoi de l'email de statut (commande ${order.id})`,
        err,
      );
    }
  }
}