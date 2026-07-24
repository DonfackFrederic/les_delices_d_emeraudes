import { Component, effect, inject } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { ProductFormStore } from '../../../../core/store/product-form.store';
import { ActivatedRoute } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { Category } from '@shared/types';
import { FormsModule } from '@angular/forms';
import { ImageUpload } from "../image-upload/image-upload";
import { OptionEditor } from "../option-editor/option-editor";

@Component({
  selector: 'app-product-form',
  imports: [FormsModule, ImageUpload, OptionEditor],
  providers: [ProductFormStore],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {
  protected readonly store = inject(ProductFormStore);
  private readonly route = inject(ActivatedRoute);
 
  protected readonly categoriesResource = httpResource<Category[]>(
    ()=> `${environment.apiUrl}/admin/categories`,
  );
 
  constructor() {
    // Synchronise les signals du formulaire dès que le produit est chargé
    // (mode édition uniquement — product() reste undefined en création).
    effect(() => {
      const product = this.store.product();
      if (product) {
        this.store.populateFromProduct(product);
      }
    });
  }
 
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.loadForEdit(id);
    }
  }
 
  protected onMainImageChange(url: string): void {
    this.store.imageUrl.set(url);
    // Sauvegarde immédiate de l'image (contrairement aux infos de base qui
    // attendent un clic explicite sur "Enregistrer") — cohérent avec le
    // comportement attendu d'un champ d'upload autonome.
    this.store.saveBasicInfo();
  }
}
