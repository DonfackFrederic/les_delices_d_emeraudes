import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductOption,
  CreateProductOptionDto,
  UpdateProductOptionDto,
  ProductOptionValue,
  CreateOptionValueDto,
  UpdateOptionValueDto,
} from '@shared/types';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/products`;
  private readonly optionsUrl = `${environment.apiUrl}/admin/options`;
  private readonly valuesUrl = `${environment.apiUrl}/admin/values`;

  // ── Produits ──────────────────────────────────────────────────────────────

  create(dto: CreateProductDto): Promise<Product> {
    return firstValueFrom(this.http.post<Product>(this.baseUrl, dto));
  }

  update(id: string, dto: UpdateProductDto): Promise<Product> {
    return firstValueFrom(this.http.patch<Product>(`${this.baseUrl}/${id}`, dto));
  }

  delete(id: string): Promise<{ success: boolean }> {
    return firstValueFrom(
      this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`),
    );
  }

  // ── Options ───────────────────────────────────────────────────────────────

  createOption(
    productId: string,
    dto: CreateProductOptionDto,
  ): Promise<ProductOption> {
    return firstValueFrom(
      this.http.post<ProductOption>(`${this.baseUrl}/${productId}/options`, dto),
    );
  }

  updateOption(id: string, dto: UpdateProductOptionDto): Promise<ProductOption> {
    return firstValueFrom(
      this.http.patch<ProductOption>(`${this.optionsUrl}/${id}`, dto),
    );
  }

  deleteOption(id: string): Promise<{ success: boolean }> {
    return firstValueFrom(
      this.http.delete<{ success: boolean }>(`${this.optionsUrl}/${id}`),
    );
  }

  // ── Valeurs d'option ──────────────────────────────────────────────────────

  createOptionValue(
    optionId: string,
    dto: CreateOptionValueDto,
  ): Promise<ProductOptionValue> {
    return firstValueFrom(
      this.http.post<ProductOptionValue>(
        `${this.optionsUrl}/${optionId}/values`,
        dto,
      ),
    );
  }

  updateOptionValue(
    id: string,
    dto: UpdateOptionValueDto,
  ): Promise<ProductOptionValue> {
    return firstValueFrom(
      this.http.patch<ProductOptionValue>(`${this.valuesUrl}/${id}`, dto),
    );
  }

  deleteOptionValue(id: string): Promise<{ success: boolean }> {
    return firstValueFrom(
      this.http.delete<{ success: boolean }>(`${this.valuesUrl}/${id}`),
    );
  }
}