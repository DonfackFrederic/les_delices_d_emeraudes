import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CategoriesService } from './categories/categories.service';
import { SupabaseModule } from './supabase/supabase.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // rend les variables d'environnement accessibles partout
    }),
    SupabaseModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService, CategoriesService],
})
export class AppModule {}
