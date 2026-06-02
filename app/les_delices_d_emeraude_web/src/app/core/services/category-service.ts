import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private http: HttpClient) {}

  // Récupère les catégories depuis l'API (endpoint: /categories)
  getCategories(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/categories`);
  }

  getCategoryBySlug(slug: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/categories/${slug}`);
  }
}
