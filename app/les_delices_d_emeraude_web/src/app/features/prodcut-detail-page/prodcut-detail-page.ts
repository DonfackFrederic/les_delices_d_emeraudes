import { Component, inject } from '@angular/core';
import { ProductDetailStore } from '../../core/store/product-details.store';
import { ProductOptions } from "./product-options/product-options";
import { ProductGallery } from "./product-gallery/product-gallery";
import { ProductPriceBlock } from "./product-price-block/product-price-block";

@Component({
  selector: 'app-prodcut-detail-page',
  imports: [ProductOptions, ProductGallery, ProductPriceBlock],
  providers: [ProductDetailStore],
  templateUrl: './prodcut-detail-page.html',
  styleUrl: './prodcut-detail-page.scss',
})
export class ProductDetailPage {
  protected store = inject(ProductDetailStore);
 
  ngOnInit(): void {
    this.store.init();
  }
}
