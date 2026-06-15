import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category, PaginatedProducts, ProductsQueryParams } from '@shared/types';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = environment.apiUrl+'/products';

  constructor(private readonly http: HttpClient) {}

  getProducts(params: ProductsQueryParams = {}): Observable<PaginatedProducts> {
    let httpParams = new HttpParams();
 
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.search)   httpParams = httpParams.set('search', params.search);
    if (params.featured !== undefined) httpParams = httpParams.set('featured', String(params.featured));
    if (params.page)     httpParams = httpParams.set('page', String(params.page));
    if (params.limit)    httpParams = httpParams.set('limit', String(params.limit ?? 12));
 
    return this.http.get<PaginatedProducts>(this.baseUrl, { params: httpParams });
  }

  getProductBySlug(slug: string, include?: string): Observable<any> {
    let params = new HttpParams();
    if (include) {
      params = params.set('include', include);
    }
    return this.http.get<any>(`${this.baseUrl}/${slug}`, { params });
  }
}
