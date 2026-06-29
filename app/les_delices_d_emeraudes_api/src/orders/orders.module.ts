import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { StripeWebhookController } from 'src/stripe/stripeWebhook.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { SupabaseModule } from '../supabase/supabase.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [SupabaseModule, StripeModule],
  controllers: [OrdersController, StripeWebhookController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService],
})
export class OrdersModule {}