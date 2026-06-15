import { Injectable, Signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { httpResource, HttpResourceRef } from "@angular/common/http";
import { Category } from "@shared/types";

@Injectable({
  providedIn: 'root',
})
export class CategoriesApResource {
  private readonly base = environment.apiUrl + '/categories';

  constructor() {}

  /**
   * Liste complète des catégories actives.
   * URL statique → fetché une seule fois, pas de re-fetch.
   */
  getCategories() : HttpResourceRef<Category[] | undefined> {
    return httpResource(() => ({
    url: this.base,
    method: 'GET',
    }));
  }

  /**
   * Détail d'une catégorie par slug.
   * @param slug string
   */
  getCategoryBySlug(slug: Signal<string>) : HttpResourceRef<Category | undefined> {
    return httpResource(() => ({
      url: `${this.base}/${slug()}`,
      method: 'GET',
    }));
  }
}