import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard d'authentification standard.
 * Rejette la requête (401) si aucun JWT valide n'est fourni.
 *
 * Usage : @UseGuards(JwtAuthGuard) sur les routes protégées
 * (dashboard client, admin, etc.)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}