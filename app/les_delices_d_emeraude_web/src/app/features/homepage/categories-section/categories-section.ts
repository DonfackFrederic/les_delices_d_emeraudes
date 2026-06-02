import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '@shared/types';
import { CategoryService } from '../../../core/services/category-service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-categories-section',
  imports: [],
  templateUrl: './categories-section.html',
  styleUrl: './categories-section.scss',
})
export class CategoriesSection implements OnInit {
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
 
  categories = signal<Category[]>([]);
  loading = signal(true);
 
  // Icônes SVG inline par slug de catégorie
  readonly categoryIcons: Record<string, string> = {
    'gateaux': `<path d="M4 17h16M4 17a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2M8 12V9m4 3V7m4 5V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    'macarons': `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M3 12h18M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9" stroke="currentColor" stroke-width="1.5"/>`,
    'tartes-tartelettes': `<path d="M3 19h18M3 19a9 9 0 0 1 18 0M12 5v2M5.6 7.6l1.4 1.4M18.4 7.6l-1.4 1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    'viennoiseries': `<path d="M3 12c0-5 3-9 9-9s9 4 9 9M3 12h18M6 12v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    'bouchees-mignardises': `<path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.7l-4.9 2.5.9-5.5L4 8.8l5.5-.8L12 3z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    'livrets-coffrets': `<path d="M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M12 12v4M10 14h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  };
 
  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats: Category[]) => {
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
 
  onCategoryClick(slug: string): void {
    this.router.navigate(['/products'], { queryParams: { category: slug } });
  }
 
  getIcon(slug: string): SafeHtml {
    const raw = this.categoryIcons[slug] ?? this.categoryIcons['gateaux'];
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  }
 
  trackByCategory(_: number, cat: Category): string {
    return cat.id;
  }
}
 

