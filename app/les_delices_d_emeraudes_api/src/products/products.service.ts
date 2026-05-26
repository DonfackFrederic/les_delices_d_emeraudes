import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from 'src/supabase/supabase.service';

interface ListQuery {
  category?: string;
  featured?: string | boolean;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private handleSupabaseError(error: PostgrestError | null): void {
    if (error) {
      throw new InternalServerErrorException(`Supabase query failed: ${error.message}`);
    }
  }

  // create(createProductDto: CreateProductDto) {
  //   return 'This action adds a new product';
  // }

  async findAll(query: ListQuery = {}) {
    const { category, featured, search, page = 1, limit = 12 } = query;
    const offset = (page - 1) * limit;

    // Build select - here keep simple; consumer can extend to include relations
    const select = '*';

    let qb: any = this.supabaseService.getClient().from('products').select(select, { count: 'exact' }).range(offset, offset + limit - 1);

    if (category) {
      qb = qb.eq('category_id', category);
    }

    if (featured !== undefined && featured !== null && featured !== '') {
      const isFeatured = featured === true || String(featured).toLowerCase() === 'true' || String(featured) === '1';
      qb = qb.eq('featured', isFeatured);
    }

    if (search) {
      const term = `%${search}%`;
      qb = qb.or(`name.ilike.${term},description.ilike.${term}`);
    }

    const { data, error, count } = await qb;
    this.handleSupabaseError(error as PostgrestError | null);

    return { data: data ?? [], meta: { total: count ?? null, page, limit } };
  }

  async findBySlug(slug: string, opts?: { include?: string }) {
    const include = opts?.include ? opts.include.split(',').map((s) => s.trim()) : [];

    // Build select string with optional relations
    let select = '*';
    if (include.length > 0) {
      const relations = include.map((r) => `${r}(*)`).join(',');
      select = `*,${relations}`;
    }

    const { data, error } = await this.supabaseService.getClient().from('products').select(select).eq('slug', slug).maybeSingle();
    this.handleSupabaseError(error as PostgrestError | null);

    if (!data) {
      throw new NotFoundException('Product not found');
    }

    return data;
  }

  // update(id: number, updateProductDto: UpdateProductDto) {
  //   return `This action updates a #${id} product`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} product`;
  // }
}
