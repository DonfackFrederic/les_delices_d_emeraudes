import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ProductsQueryParams } from '@shared/types';
import type { PostgrestError } from '@supabase/supabase-js';
import { ProductsRepository } from './products.repository';
import { toCamel } from 'src/utils/data-transformer.util';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  private handleSupabaseError(error: PostgrestError | null): void {
    if (error) {
      throw new InternalServerErrorException(`Supabase query failed: ${error.message}`);
    }
  }

  // create(createProductDto: CreateProductDto) {
  //   return 'This action adds a new product';
  // }

  async findAll(query: ProductsQueryParams = {}) {
    let { data, error, count } = await this.productsRepository.findAll(query);
    data = toCamel(data)
    const { page = 1, limit = 12 } = query;

    this.handleSupabaseError(error as PostgrestError | null);

    return { data: data ?? [], meta: { total: count ?? null, page, limit } };
  }

  async findBySlug(slug: string, opts?: { include?: string }) {
    let { data, error } = await this.productsRepository.findBySlug(slug, opts?.include);
    data = toCamel(data)
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
