import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard d'authentification optionnel.
 *
 * - Si un JWT valide est fourni → `req.user` est peuplé (comportement identique
 *   à JwtAuthGuard).
 * - Si aucun token, ou un token invalide/expiré → la requête continue quand
 *   même, `req.user` reste `undefined`.
 *
 * Utile pour les routes qui acceptent à la fois les invités et les
 * utilisateurs connectés (ex: POST /orders/create-intent).
 *
 * ⚠️ Ne PAS utiliser sur des routes qui doivent strictement être protégées :
 * utiliser JwtAuthGuard dans ce cas.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // canActivate ne doit jamais retourner `false` ni rejeter :
  // on tente l'auth, mais on laisse toujours passer la requête.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
    } catch {
      // Token absent/invalide : on ignore, la requête continue en mode invité.
    }
    return true;
  }
}