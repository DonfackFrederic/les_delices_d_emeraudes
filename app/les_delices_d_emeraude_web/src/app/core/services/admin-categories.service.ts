import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@shared/types';
import { environment } from '../../../environments/environment';

/**
 * Service data pour les catégories admin.
 * Wrapper mince — aucune logique, juste les appels HTTP vers les routes
 * déjà codées au Bloc A (AdminCategoriesController).
 * Les listes se lisent via httpResource directement dans les composants ;
 * ce service ne fournit que les mutations (create/update/delete).
 */
@Injectable({ providedIn: 'root' })
export class AdminCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/categories`;

  create(dto: CreateCategoryDto): Promise<Category> {
    return firstValueFrom(this.http.post<Category>(this.baseUrl, dto));
  }

  update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    return firstValueFrom(this.http.patch<Category>(`${this.baseUrl}/${id}`, dto));
  }

  delete(id: string): Promise<{ success: boolean }> {
    return firstValueFrom(
      this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`),
    );
  }
}