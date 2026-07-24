import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Category } from '@shared/types';
import { AdminCategoriesService } from '../../../../core/services/admin-categories.service';
import { StorageUploadService } from '../../../../core/services/storage-upload.service';
import { FormsModule } from '@angular/forms';


/**
 * Modal de création/édition d'une catégorie.
 * Mode déterminé par la présence de `category` (édition) ou son absence (création).
 *
 * Communication par signals uniquement :
 * - `category` (input) : catégorie à éditer, ou undefined pour une création
 * - `saved` (output signal-based) : émis avec la catégorie créée/modifiée
 * - `closed` (output signal-based) : émis quand l'utilisateur annule/ferme
 */
@Component({
  selector: 'app-category-form-modal',
  imports: [FormsModule],
  templateUrl: './category-form-modal.html',
  styleUrl: './category-form-modal.scss',
})
export class CategoryFormModal {
  private readonly categoriesService = inject(AdminCategoriesService);
  private readonly storageUploadService = inject(StorageUploadService);
 
  readonly category = input<Category>();
  readonly saved = output<Category>();
  readonly closed = output<void>();
 
  protected readonly isEditMode = computed(() => !!this.category());
 
  protected readonly name = signal('');
  protected readonly slug = signal('');
  protected readonly description = signal('');
  protected readonly imageUrl = signal('');
  protected readonly isActive = signal(true);
 
  protected readonly isSaving = signal(false);
  protected readonly isUploading = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly uploadError = signal<string | null>(null);
 
  private slugManuallyEdited = false;
 
  constructor() {
    // Pré-remplir le formulaire quand `category` est fourni (mode édition)
    effect(() => {
      const cat = this.category();
      if (cat) {
        this.name.set(cat.name);
        this.slug.set(cat.slug);
        this.description.set(cat.description ?? '');
        this.imageUrl.set(cat.imageUrl ?? '');
        this.isActive.set(cat.isActive);
        this.slugManuallyEdited = true; // ne pas auto-régénérer en édition
      }
    });
  }
 
  protected onNameChange(value: string): void {
    if (!this.slugManuallyEdited && !this.isEditMode()) {
      this.slug.set(this.slugify(value));
    }
  }
 
  protected async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
 
    this.isUploading.set(true);
    this.uploadError.set(null);
 
    try {
      // Utilise le slug (ou un id temporaire) comme dossier de rangement
      const entityId = this.slug() || `temp-${Date.now()}`;
      const { publicUrl } = await this.storageUploadService.upload(
        file,
        'categories',
        entityId,
      );
      this.imageUrl.set(publicUrl);
    } catch (err) {
      this.uploadError.set(
        err instanceof Error ? err.message : 'Échec de l\'upload.',
      );
    } finally {
      this.isUploading.set(false);
    }
  }
 
  protected async save(): Promise<void> {
    this.isSaving.set(true);
    this.saveError.set(null);
 
    const dto = {
      name: this.name().trim(),
      slug: this.slug().trim(),
      description: this.description().trim() || null,
      imageUrl: this.imageUrl().trim() || null,
      isActive: this.isActive(),
    };
 
    try {
      const result = this.isEditMode()
        ? await this.categoriesService.update(this.category()!.id, dto)
        : await this.categoriesService.create(dto);
 
      this.saved.emit(result);
    } catch (err: unknown) {
      this.saveError.set(this.extractErrorMessage(err));
    } finally {
      this.isSaving.set(false);
    }
  }
 
  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
 
  private extractErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const apiError = (err as { error: { message?: string } }).error;
      if (apiError?.message) return apiError.message;
    }
    return 'Une erreur est survenue. Veuillez réessayer.';
  }
}
