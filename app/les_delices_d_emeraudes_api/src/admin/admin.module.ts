import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';

// Categories
import { AdminCategoriesController } from './categories/admin-categories.controller';
import { AdminCategoriesService } from './categories/admin-categories.service';
import { AdminCategoriesRepository } from './categories/admin-categories.repository';

// Products
import {
  AdminProductsController,
  AdminOptionsController,
  AdminValuesController,
} from './products/admin-products.contoller';
import { AdminProductsService } from './products/admin-products.service';
import { AdminProductsRepository } from './products/admin-products.repository';

// Orders
import { AdminOrdersController } from './orders/admin-orders.controller';
import { AdminOrdersService } from './orders/admin-orders.service';
import { AdminOrdersRepository } from './orders/admin-orders.repository';

// Stats
import { AdminStatsController } from './stats/admin-stats.controller';
import { AdminStatsService } from './stats/admin-stats.service';
import { AdminStatsRepository } from './stats/admin-stats.repository';

@Module({
  imports: [SupabaseModule],
  controllers: [
    AdminCategoriesController,
    AdminProductsController,
    AdminOptionsController,
    AdminValuesController,
    AdminOrdersController,
    AdminStatsController,
  ],
  providers: [
    AdminCategoriesService,
    AdminCategoriesRepository,
    AdminProductsService,
    AdminProductsRepository,
    AdminOrdersService,
    AdminOrdersRepository,
    AdminStatsService,
    AdminStatsRepository,
  ],
})
export class AdminModule {}