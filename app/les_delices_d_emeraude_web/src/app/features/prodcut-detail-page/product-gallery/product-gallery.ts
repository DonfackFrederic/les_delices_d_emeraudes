import { Component, inject } from '@angular/core';
import { ProductDetailStore } from '../../../core/store/product-details.store';

@Component({
  selector: 'app-product-gallery',
  imports: [],
  templateUrl: './product-gallery.html',
  styleUrl: './product-gallery.scss',
})
export class ProductGallery {
  protected store = inject(ProductDetailStore);
}
