import { Component, inject, input, output, signal } from '@angular/core';
import { ProductOption, ProductOptionType } from '@shared/types';
import { AdminProductsService } from '../../../../core/services/admin-products.service';
import { FormsModule } from '@angular/forms';


/**
 * Éditeur d'options imbriqué : liste les options existantes, permet d'en
 * ajouter, modifier, supprimer — et pour chaque option de type 'select',
 * gère ses valeurs (ajout/édition/suppression) de la même façon.
 *
 * Chaque mutation appelle directement AdminProductsService et émet
 * `changed` pour que le parent recharge le produit complet — pas d'état
 * dupliqué localement au-delà de ce qui est nécessaire à l'édition en cours.
 */
@Component({
  selector: 'app-option-editor',
  imports: [FormsModule],
  templateUrl: './option-editor.html',
  styleUrl: './option-editor.scss',
})
export class OptionEditor {
  private readonly productsService = inject(AdminProductsService);
 
  readonly productId = input.required<string>();
  readonly options = input.required<ProductOption[]>();
 
  /** Émis après toute mutation réussie — le parent recharge le produit. */
  readonly changed = output<void>();
 
  protected readonly error = signal<string | null>(null);
  protected readonly isCreatingOption = signal(false);
 
  protected readonly newOptionName = signal('');
  protected readonly newOptionType = signal<ProductOptionType>('select');
  protected readonly newOptionRequired = signal(false);
 
  protected readonly draftValues: Record<string, string> = {};
  protected readonly draftPriceModifiers: Record<string, number> = {};
 
  protected typeLabel(type: ProductOptionType): string {
    const labels: Record<ProductOptionType, string> = {
      select: 'Liste de choix',
      text: 'Texte libre',
      boolean: 'Case à cocher',
    };
    return labels[type];
  }
 
  protected async createOption(): Promise<void> {
    const name = this.newOptionName().trim();
    if (!name) return;
 
    this.isCreatingOption.set(true);
    this.error.set(null);
 
    try {
      await this.productsService.createOption(this.productId(), {
        name,
        type: this.newOptionType(),
        isRequired: this.newOptionRequired(),
      });
 
      this.newOptionName.set('');
      this.newOptionType.set('select');
      this.newOptionRequired.set(false);
      this.changed.emit();
    } catch {
      this.error.set('Impossible de créer l\'option.');
    } finally {
      this.isCreatingOption.set(false);
    }
  }
 
  protected async toggleRequired(option: ProductOption): Promise<void> {
    this.error.set(null);
    try {
      await this.productsService.updateOption(option.id, {
        isRequired: !option.isRequired,
      });
      this.changed.emit();
    } catch {
      this.error.set('Impossible de modifier l\'option.');
    }
  }
 
  protected async deleteOption(option: ProductOption): Promise<void> {
    const confirmed = window.confirm(
      `Supprimer l'option "${option.name}" et toutes ses valeurs ?`,
    );
    if (!confirmed) return;
 
    this.error.set(null);
    try {
      await this.productsService.deleteOption(option.id);
      this.changed.emit();
    } catch {
      this.error.set('Impossible de supprimer l\'option.');
    }
  }
 
  protected async addValue(option: ProductOption): Promise<void> {
    const value = (this.draftValues[option.id] || '').trim();
    if (!value) return;

    this.error.set(null);
    try {
      await this.productsService.createOptionValue(option.id, {
        value,
        priceModifier: this.draftPriceModifiers[option.id] ?? 0,
      });
      this.draftValues[option.id] = '';
      this.draftPriceModifiers[option.id] = 0;
      this.changed.emit();
    } catch {
      this.error.set('Impossible d\'ajouter la valeur.');
    }
  }
 
  protected async deleteValue(option: ProductOption, valueId: string): Promise<void> {
    this.error.set(null);
    try {
      await this.productsService.deleteOptionValue(valueId);
      this.changed.emit();
    } catch {
      this.error.set('Impossible de supprimer la valeur.');
    }
  }
}
