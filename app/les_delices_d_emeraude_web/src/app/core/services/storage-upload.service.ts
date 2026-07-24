import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const BUCKET_NAME = 'images';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface UploadResult {
  publicUrl: string;
}

export class InvalidImageError extends Error {}

/**
 * Upload direct vers Supabase Storage (bucket public "images"), sans
 * transiter par le backend NestJS — cf. décision d'architecture Sprint 3
 * Bloc A : NestJS ne stocke que des URLs (string), jamais de fichiers.
 *
 * Utilise l'anon key (accès public en écriture limité par les Storage
 * Policies configurées dans le Dashboard Supabase — voir note ci-dessous).
 */
@Injectable({ providedIn: 'root' })
export class StorageUploadService {
  private readonly supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
  );

  /**
   * Upload une image vers le bucket "images", sous un chemin organisé par
   * type d'entité (products/xxx ou categories/xxx).
   *
   * @throws InvalidImageError si le type MIME ou la taille ne sont pas valides
   */
  async upload(
    file: File,
    folder: 'products' | 'categories',
    entityId: string,
  ): Promise<UploadResult> {
    this.validateFile(file);

    const path = `${folder}/${entityId}/${Date.now()}-${this.sanitizeFileName(file.name)}`;

    const { data, error } = await this.supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new Error(`Échec de l'upload : ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return { publicUrl: publicUrlData.publicUrl };
  }

  private validateFile(file: File): void {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new InvalidImageError(
        'Format non supporté. Utilisez JPEG, PNG ou WebP.',
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new InvalidImageError('Image trop volumineuse (max 5 Mo).');
    }
  }

  private sanitizeFileName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // retire les accents
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .toLowerCase();
  }
}