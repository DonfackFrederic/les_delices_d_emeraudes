import { Component, inject, signal } from '@angular/core';
import { CategoryFormModal } from "./category-form-modal/category-form-modal";
import { environment } from '../../../../environments/environment';
import { httpResource } from '@angular/common/http';
import { AdminCategoriesService } from '../../../core/services/admin-categories.service';
import { Category } from '@shared/types';

@Component({
  selector: 'app-admin-categories-page',
  imports: [CategoryFormModal],
  templateUrl: './admin-categories-page.html',
  styleUrl: './admin-categories-page.scss',
})
export class AdminCategoriesPage {
  private readonly categoriesService = inject(AdminCategoriesService);
 
  protected readonly categoriesResource = httpResource<Category[]>(
    () => `${environment.apiUrl}/admin/categories`,
  );
  protected readonly categories = this.categoriesResource.value;
 
  protected readonly isModalOpen = signal(false);
  protected readonly editingCategory = signal<Category | undefined>(undefined);
  protected readonly deleteError = signal<string | null>(null);
 
  protected openCreateModal(): void {
    this.editingCategory.set(undefined);
    this.isModalOpen.set(true);
  }
 
  protected openEditModal(category: Category): void {
    this.editingCategory.set(category);
    this.isModalOpen.set(true);
  }
 
  protected closeModal(): void {
    this.isModalOpen.set(false);
  }
 
  protected onSaved(): void {
    this.isModalOpen.set(false);
    this.categoriesResource.reload();
  }
 
  protected async confirmDelete(category: Category): Promise<void> {
    const confirmed = window.confirm(
      `Supprimer la catégorie "${category.name}" ? Cette action est irréversible.`,
    );
    if (!confirmed) return;
 
    this.deleteError.set(null);
 
    try {
      await this.categoriesService.delete(category.id);
      this.categoriesResource.reload();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'error' in err
          ? (err as { error: { message?: string } }).error?.message
          : null;
      this.deleteError.set(message ?? 'Impossible de supprimer cette catégorie.');
      setTimeout(() => this.deleteError.set(null), 5000);
    }
  }
}
