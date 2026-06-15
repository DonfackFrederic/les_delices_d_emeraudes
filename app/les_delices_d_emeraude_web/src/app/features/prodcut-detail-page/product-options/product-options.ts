import { Component, inject } from '@angular/core';
import { ProductDetailStore } from '../../../core/store/product-details.store';
import { ProductOptionItem } from "../product-option-item/product-option-item";

@Component({
  selector: 'app-product-options',
  imports: [ProductOptionItem],
  templateUrl: './product-options.html',
  styleUrl: './product-options.scss',
})
export class ProductOptions {
  protected store = inject(ProductDetailStore);
}
 
