import { Injectable } from '@nestjs/common';
import { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../../supabase/supabase.service';
import { AdminStats } from '@shared/types';
import { toCamel } from 'src/utils/data-transformer.util';

@Injectable()
export class AdminStatsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * KPIs agrégés + graphique 30 jours via une seule requête SQL.
   * On utilise rpc() pour garder la logique d'agrégation côté Postgres
   * plutôt que de faire plusieurs requêtes PostgREST enchaînées.
   */
  async getStats(): Promise<{
    data: AdminStats | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .rpc('get_admin_stats');

    if (error) return { data: null, error };
    return { data: toCamel(data) as AdminStats, error: null };
  }
}