import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from 'src/dto/create-order.dto';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth.guard';
import { CreateOrderIntentResponse } from '@shared/types';
import { AuthenticatedUser, CurrentUser } from 'src/auth/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Crée une commande + un PaymentIntent Stripe.
   * Accessible aux invités ET aux utilisateurs connectés
   * (OptionalJwtAuthGuard n'impose pas de token).
   */
  @Post('create-intent')
  @UseGuards(OptionalJwtAuthGuard)
  async createIntent(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: AuthenticatedUser | null,
  ): Promise<CreateOrderIntentResponse> {
    return this.ordersService.createOrderIntent(dto, user?.id ?? null);
  }

  /**
   * Lecture d'une commande par id — utilisée par OrderConfirmationPage.
   * Route publique volontairement (l'id est un UUID non-devinable, et le
   * frontend en a besoin juste après le paiement, avant même qu'une session
   * ne soit nécessairement établie pour les invités).
   *
   * ⚠️ Ne retourne aucune donnée sensible additionnelle au-delà de ce que
   * l'utilisateur a lui-même soumis. Si une restriction plus stricte est
   * nécessaire plus tard, ajouter une vérification user_id ici.
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const order = await this.ordersService.findById(id);
    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }
    return order;
  }
}