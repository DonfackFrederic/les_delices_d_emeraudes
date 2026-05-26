import { Module } from '@nestjs/common';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
