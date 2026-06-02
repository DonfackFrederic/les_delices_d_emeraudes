import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProductsQueryParams } from '@shared/types';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = environment.apiUrl+'/products';

  constructor(private readonly http: HttpClient) {}

  getProducts( query: ProductsQueryParams
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('limit', String(query.limit));

    if (query.category) {
      params = params.set('category', query.category);
    }
    if (query.featured) {
      params = params.set('featured', query.featured);
    }
    if (query.search) {
      params = params.set('search', query.search);
    }

    return this.http.get<any>(this.baseUrl, { params });
  }

  getProductBySlug(slug: string, include?: string): Observable<any> {
    let params = new HttpParams();
    if (include) {
      params = params.set('include', include);
    }
    return this.http.get<any>(`${this.baseUrl}/${slug}`, { params });
  }
}
