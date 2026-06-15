import { Component, inject } from '@angular/core';
import { ProductDetailStore } from '../../core/store/product-details.store';
import { ProductOptions } from "./product-options/product-options";
import { ProductGallery } from "./product-gallery/product-gallery";
import { ProductPriceBlock } from "./product-price-block/product-price-block";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-prodcut-detail-page',
  imports: [ProductOptions, ProductGallery, ProductPriceBlock, RouterLink],
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
