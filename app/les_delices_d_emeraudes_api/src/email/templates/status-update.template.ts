import { Order, OrderStatus } from '@shared/types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface StatusContent {
  subject: string;
  emoji: string;
  heading: string;
  message: string;
}

// Cf. SPRINT_3.md — S3-08, table des messages par statut
const STATUS_CONTENT: Partial<Record<OrderStatus, StatusContent>> = {
  preparing: {
    subject: 'Votre commande est en préparation 👩‍🍳',
    emoji: '👩‍🍳',
    heading: 'En préparation',
    message: 'On prépare vos délices avec amour !',
  },
  ready: {
    subject: 'Votre commande est prête ! 🎉',
    emoji: '🎉',
    heading: 'Prête',
    message: 'Votre commande est prête à être récupérée.',
  },
  delivered: {
    subject: 'Commande livrée — Merci ! ❤️',
    emoji: '❤️',
    heading: 'Livrée',
    message: 'Bonne dégustation !',
  },
  cancelled: {
    subject: 'Commande annulée',
    emoji: '😔',
    heading: 'Annulée',
    message: 'Votre commande a été annulée. Contactez-nous pour plus d\'infos.',
  },
};

/**
 * Retourne null si le statut ne déclenche pas d'email (ex: pending, confirmed
 * — déjà couverts par l'email de confirmation initiale envoyé au paiement).
 */
export function getStatusEmailSubject(status: OrderStatus): string | null {
  return STATUS_CONTENT[status]?.subject ?? null;
}

export function buildStatusUpdateTemplate(order: Order, status: OrderStatus): string | null {
  const content = STATUS_CONTENT[status];
  if (!content) return null;

  return `
    <div style="font-family:'Inter',system-ui,sans-serif;max-width:560px;margin:0 auto;color:#333;">
      <div style="text-align:center;padding:32px 0 24px;">
        <div style="font-size:2.5rem;">${content.emoji}</div>
        <h1 style="font-family:Georgia,serif;font-size:1.5rem;color:#004D40;margin:12px 0 0;">
          ${content.heading}
        </h1>
      </div>

      <p>Bonjour ${escapeHtml(order.customerName)},</p>
      <p>${content.message}</p>

      <div style="background:#f8f8f8;border-radius:8px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;color:#666;font-size:0.85em;">
          Commande #${order.id.slice(0, 8).toUpperCase()} — ${order.totalPrice.toFixed(2)} $
        </p>
      </div>

      <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;">
      <p style="color:#999;font-size:0.75em;text-align:center;">
        LES DELICES D EMERAUDES — Merci de votre confiance 💛
      </p>
    </div>
  `;
}