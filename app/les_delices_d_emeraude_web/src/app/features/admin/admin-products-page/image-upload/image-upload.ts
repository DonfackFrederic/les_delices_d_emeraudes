import { Component, inject, input, model, signal } from '@angular/core';
import { StorageUploadService } from '../../../../core/services/storage-upload.service';


/**
 * Champ image réutilisable : upload direct Supabase Storage OU URL collée
 * manuellement (les deux approches — cf. décision produit Sprint 3 Bloc A).
 *
 * Utilise `model()` (two-way binding signal-based) plutôt que
 * input()+output() séparés, car c'est exactement le cas d'usage prévu pour
 * model() : une valeur simple synchronisée dans les deux sens avec le parent.
 */
@Component({
  selector: 'app-image-upload',
  imports: [],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.scss',
})
export class ImageUpload {
  private readonly storageUploadService = inject(StorageUploadService);
 
  readonly label = input<string>('Image');
  readonly folder = input.required<'products' | 'categories'>();
  readonly entityId = input.required<string>();
 
  /** Two-way binding signal-based : [(value)]="signal" côté parent */
  readonly value = model<string>('');
 
  protected readonly isUploading = signal(false);
  protected readonly error = signal<string | null>(null);
 
  protected onUrlInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value.set(input.value);
  }
 
  protected async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
 
    this.isUploading.set(true);
    this.error.set(null);
 
    try {
      const { publicUrl } = await this.storageUploadService.upload(
        file,
        this.folder(),
        this.entityId(),
      );
      this.value.set(publicUrl);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Échec de l\'upload.');
    } finally {
      this.isUploading.set(false);
      input.value = ''; // permet de re-sélectionner le même fichier si besoin
    }
  }
}
