import { Component, inject } from '@angular/core';
import { ProductDetailStore } from '../../../core/store/product-details.store';

@Component({
  selector: 'app-product-price-block',
  imports: [],
  templateUrl: './product-price-block.html',
  styleUrl: './product-price-block.scss',
})
export class ProductPriceBlock {
  protected store = inject(ProductDetailStore);
 
  format(val: number): string {
    return val.toFixed(2).replace('.', ',') + ' $';
  }
}
 
