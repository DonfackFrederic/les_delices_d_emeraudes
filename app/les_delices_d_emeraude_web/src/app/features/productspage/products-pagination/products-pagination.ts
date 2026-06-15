import { Component, inject, input, output, SimpleChanges } from '@angular/core';
import { ProductsStore } from '../../../core/store/products.store';

@Component({
  selector: 'app-products-pagination',
  imports: [],
  templateUrl: './products-pagination.html',
  styleUrl: './products-pagination.scss',
})
export class ProductPagination  {
    protected store = inject(ProductsStore);
 
  get pages(): PageItem[] {
    const total   = this.store.totalPages();
    const current = this.store.page();
 
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
 
    const items: PageItem[] = [1];
    const winStart = Math.max(2, current - 2);
    const winEnd   = Math.min(total - 1, current + 2);
 
    if (winStart > 2)       items.push('…');
    for (let i = winStart; i <= winEnd; i++) items.push(i);
    if (winEnd < total - 1) items.push('…');
    items.push(total);
 
    return items;
  }
 
  isDots(p: PageItem): p is '…' { return p === '…'; }
  track(_: number, p: PageItem): string { return String(p); }

}

type PageItem = number | '…';

