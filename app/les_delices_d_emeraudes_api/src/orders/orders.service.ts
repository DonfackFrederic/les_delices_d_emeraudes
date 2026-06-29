import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrdersRepository } from './orders.repository';
import { StripeService } from '../stripe/stripe.service';
import { CreateOrderDto } from 'src/dto/create-order.dto';
import { CreateOrderItemDto } from 'src/dto/create-order-item.dto';
import { CreateOrderIntentResponse } from '@shared/types';
import { CalculatedOrder, CalculatedOrderItem, PricingProduct } from 'src/types/orders.types';

const PRICE_TOLERANCE = 0.01; // écart maximal toléré en $ (cf. ADR-004)

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Point d'entrée principal : POST /orders/create-intent
   *
   * 1. Recalcule entièrement le prix depuis la DB (jamais confiance au client)
   * 2. Rejette si écart > 0,01$ avec expectedTotal
   * 3. Persiste la commande + items + options (transaction atomique via RPC)
   * 4. Crée le PaymentIntent Stripe
   * 5. Attache le paymentIntentId à la commande
   * 6. Retourne { orderId, clientSecret }
   */
  async createOrderIntent(
    dto: CreateOrderDto,
    userId: string | null,
  ): Promise<CreateOrderIntentResponse> {
    const calculated = await this.calculateOrder(dto.items);

    this.assertPriceMatches(calculated.totalPrice, dto.expectedTotal);

    const { data: order, error: orderError } =
      await this.ordersRepository.createOrderWithItems(
        calculated,
        {
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          deliveryNotes: dto.deliveryNotes,
        },
        userId,
      );

    if (orderError || !order) {
      this.logger.error('Échec de création de la commande', orderError);
      throw new BadRequestException(
        'Impossible de créer la commande. Veuillez réessayer.',
      );
    }

    const { paymentIntentId, clientSecret } =
      await this.stripeService.createPaymentIntent({
        amount: calculated.totalPrice,
        currency: 'cad',
        metadata: { orderId: order.id },
      });

    const { error: updateError } =
      await this.ordersRepository.setPaymentIntentId(
        order.id,
        paymentIntentId,
      );

    if (updateError) {
      // La commande existe et le PaymentIntent aussi, mais le lien n'a pas
      // été sauvegardé. Le webhook ne pourra pas retrouver la commande.
      // On logue en erreur critique mais on ne bloque pas l'utilisateur :
      // le paiement peut continuer, un job de réconciliation pourra
      // rattraper ça plus tard (cf. SUIVI.md - risques identifiés).
      this.logger.error(
        `Commande ${order.id} créée mais setPaymentIntentId a échoué`,
        updateError,
      );
    }

    return { orderId: order.id, clientSecret };
  }

  /**
   * Recharge chaque produit depuis la DB et recalcule le prix total.
   * Construit en même temps le snapshot complet (nom, image, options)
   * qui sera persisté dans order_items / order_item_options.
   */
  private async calculateOrder(
    items: CreateOrderItemDto[],
  ): Promise<CalculatedOrder> {
    const calculatedItems: CalculatedOrderItem[] = [];
    let totalPrice = 0;

    for (const item of items) {
      const { data: product, error } =
        await this.ordersRepository.findProductForPricing(item.productId);

      if (error) {
        this.logger.error(
          `Erreur lors de la lecture du produit ${item.productId}`,
          error,
        );
        throw new BadRequestException(
          `Produit ${item.productId} indisponible`,
        );
      }

      if (!product) {
        throw new BadRequestException(
          `Produit ${item.productId} indisponible`,
        );
      }

      const calculatedItem = this.calculateItem(product, item);
      calculatedItems.push(calculatedItem);
      totalPrice += calculatedItem.lineTotal;
    }

    // Arrondi à 2 décimales pour éviter les artefacts de virgule flottante
    totalPrice = Math.round(totalPrice * 100) / 100;

    return { items: calculatedItems, totalPrice };
  }

  /**
   * Calcule le prix d'un item à partir des données serveur (jamais celles
   * envoyées par le client), et construit le snapshot des options.
   */
  private calculateItem(
    product: PricingProduct,
    item: CreateOrderItemDto,
  ): CalculatedOrderItem {
    const allValues = product.options.flatMap((opt) =>
      opt.values.map((v) => ({ ...v, optionName: opt.name })),
    );

    let optionsTotal = 0;
    const snapshotOptions = item.selectedOptions.map((selected) => {
      // Pour les options de type 'select', on retrouve la valeur exacte
      // en DB (et donc son priceModifier réel, pas celui envoyé par le client).
      const matchedValue = selected.valueId
        ? allValues.find((v) => v.id === selected.valueId)
        : undefined;

      const priceModifier = matchedValue
        ? Number(matchedValue.priceModifier)
        : 0; // options 'text'/'boolean' sans valueId → pas de price_modifier serveur

      optionsTotal += priceModifier;

      return {
        optionName: selected.optionName,
        value: selected.value,
        priceModifier,
      };
    });

    const lineTotal =
      (Number(product.basePrice) + optionsTotal) * item.quantity;

    return {
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl,
      basePrice: Number(product.basePrice),
      quantity: item.quantity,
      lineTotal: Math.round(lineTotal * 100) / 100,
      comment: item.comment ?? null,
      options: snapshotOptions,
    };
  }

  /**
   * Rejette la commande si le total calculé serveur diverge trop du total
   * attendu envoyé par le frontend (cf. ADR-004).
   */
  private assertPriceMatches(
    calculatedTotal: number,
    expectedTotal: number,
  ): void {
    const diff = Math.abs(calculatedTotal - expectedTotal);
    if (diff > PRICE_TOLERANCE) {
      throw new BadRequestException(
        'Prix incohérent. Veuillez recharger la page.',
      );
    }
  }

  /**
   * Appelée depuis StripeController lors de l'événement
   * payment_intent.succeeded. Marque la commande comme payée.
   * Retourne la commande complète (pour l'envoi d'email — Sprint 3).
   */
  async markOrderAsPaid(stripePaymentIntentId: string) {
    const { data: order, error } = await this.ordersRepository.markAsPaid(
      stripePaymentIntentId,
    );

    if (error) {
      this.logger.error(
        `Échec markOrderAsPaid pour PaymentIntent ${stripePaymentIntentId}`,
        error,
      );
      return null;
    }

    if (!order) {
      this.logger.warn(
        `Aucune commande trouvée pour PaymentIntent ${stripePaymentIntentId}`,
      );
      return null;
    }

    this.logger.log(`Commande ${order.id} marquée comme payée`);
    return order;
  }

  async findById(orderId: string) {
    const { data, error } = await this.ordersRepository.findById(orderId);
    if (error) {
      this.logger.error(`Erreur lecture commande ${orderId}`, error);
      return null;
    }
    return data;
  }
}