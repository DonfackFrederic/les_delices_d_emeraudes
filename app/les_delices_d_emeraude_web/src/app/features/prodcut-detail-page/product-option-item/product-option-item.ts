import { Component, computed, inject, Input, input } from '@angular/core';
import { ProductOption, ProductOptionValue, SelectedOption } from '@shared/types';
import { ProductDetailStore } from '../../../core/store/product-details.store';

@Component({
  selector: 'app-product-option-item',
  imports: [],
  templateUrl: './product-option-item.html',
  styleUrl: './product-option-item.scss',
})
export class ProductOptionItem {
  @Input({ required: true }) option!: ProductOption;
 
  protected store = inject(ProductDetailStore);
 
  // ── Valeur actuellement sélectionnée pour cette option ───
  protected currentSelection = computed(() =>
    this.store.selections().find(s => s.optionId === this.option.id) ?? null
  );
 
  protected isSelected = computed(() => this.currentSelection() !== null);
 
  protected isBooleanChecked = computed(() =>
    this.store.selections().some(s => s.optionId === this.option.id)
  );
 
  protected textValue = computed(() =>
    this.currentSelection()?.value ?? ''
  );
 
  // ── Handlers ─────────────────────────────────────────────
 
  selectValue(value: ProductOptionValue): void {
    const selected: SelectedOption = {
      optionId:      this.option.id,
      optionName:    this.option.name,
      valueId:       value.id,
      value:         value.value,
      priceModifier: value.priceModifier,
    };
    this.store.selectOption(this.option, selected);
  }
 
  onTextInput(value: string): void {
    if (!value.trim()) {
      this.store.clearOption(this.option.id);
      return;
    }
    this.store.selectOption(this.option, {
      optionId:      this.option.id,
      optionName:    this.option.name,
      value:         value.trim(),
      priceModifier: 0,
    });
  }
 
  toggleBoolean(priceModifier: number): void {
    this.store.toggleBoolean(this.option, priceModifier);
  }
 
  isValueSelected(value: ProductOptionValue): boolean {
    return this.currentSelection()?.valueId === value.id;
  }
 
  formatModifier(mod: number): string {
    if (mod === 0) return '';
    return mod > 0 ? `+${mod.toFixed(2)} $` : `${mod.toFixed(2)} $`;
  }
}
 
