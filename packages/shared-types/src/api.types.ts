// ─── Enveloppe générique des réponses d'erreur NestJS ────────────────────────

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// ─── Réponse générique paginée (réutilisable) ─────────────────────────────────

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}