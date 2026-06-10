import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductsStore } from '../../../core/store/products.store';
import { SearchBar } from "../search-bar/search-bar";

@Component({
  selector: 'app-product-filters',
  imports: [FormsModule, SearchBar],
  templateUrl: './product-filters.html',
  styleUrl: './product-filters.scss',
})
export class ProductFilters {
  protected store = inject(ProductsStore);
}
 

