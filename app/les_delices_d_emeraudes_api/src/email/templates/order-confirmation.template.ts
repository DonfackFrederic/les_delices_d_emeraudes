import { Order } from '@shared/types';

/**
 * Échappement HTML basique pour éviter l'injection via des champs utilisateur
 * (customerName, comment, deliveryNotes...) insérés dans le template.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// TODO : remplacer le logo par une URL dynamique (configurable dans l'admin) pour que l'email reflète le branding du site.
const logoUrl = 'https://votre-domaine.com/assets/logo-email.png';

function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} $`;
}

export function buildOrderConfirmationTemplate(order: Order): string {
  const itemsHtml = order.items
    .map((item) => {
      const optionsHtml =
        item.options.length > 0
          ? `<br><small style="color:#666;">${item.options
              .map((o) => `${escapeHtml(o.optionName)} : ${escapeHtml(o.value)}`)
              .join(', ')}</small>`
          : '';

      const commentHtml = item.comment
        ? `<br><em style="color:#666;font-size:0.85em;">Note : ${escapeHtml(item.comment)}</em>`
        : '';

      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;">
            <strong>${escapeHtml(item.productName)}</strong> × ${item.quantity}
            ${optionsHtml}
            ${commentHtml}
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">
            ${formatPrice(item.lineTotal)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <div style="font-family:'Inter',system-ui,sans-serif;max-width:560px;margin:0 auto;color:#333;">
      <div style="text-align:center;padding:32px 0 24px;">
        <img
          src="${logoUrl}"
          alt="Logo Les Délices d'Émeraudes"
          width="120"
          style="display:block;margin:0 auto 16px;max-width:160px;height:auto;"
        />
        <h1 style="font-family:Georgia,serif;font-size:1.5rem;color:#004D40;margin:12px 0 0;">
          Merci pour votre commande !
        </h1>
      </div>

      <p>Bonjour ${escapeHtml(order.customerName)},</p>
      <p>Votre commande a bien été reçue et confirmée. Voici le récapitulatif :</p>

      <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 8px;color:#666;font-size:0.85em;">
          Commande #${order.id.slice(0, 8).toUpperCase()}
        </p>

        <table style="width:100%;border-collapse:collapse;">
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding:16px 0 0;font-weight:700;">Total</td>
              <td style="padding:16px 0 0;font-weight:700;text-align:right;color:#004D40;font-size:1.1em;">
                ${formatPrice(order.totalPrice)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      ${
        order.deliveryNotes
          ? `<div style="margin:20px 0;">
               <p style="margin:0 0 4px;font-weight:600;font-size:0.9em;">Instructions spéciales</p>
               <p style="margin:0;color:#666;">${escapeHtml(order.deliveryNotes)}</p>
             </div>`
          : ''
      }

      <p style="color:#666;font-size:0.85em;margin-top:32px;">
        Vous recevrez un email à chaque étape de la préparation de votre commande.
      </p>

      <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;">
      <p style="color:#999;font-size:0.75em;text-align:center;">
        LES DELICES D EMERAUDES — Merci de votre confiance 💛
      </p>
    </div>
  `;
}