import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@shared/types';
import { ROLES_KEY } from './roles.decorator';

/**
 * Guard de contrôle d'accès par rôle.
 *
 * Doit toujours être utilisé APRÈS JwtAuthGuard (qui peuple req.user) :
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *
 * Si aucun rôle n'est défini sur la route (@Roles absent), le guard laisse
 * passer — c'est JwtAuthGuard qui gère l'authentification seule.
 *
 * Retourne 403 (pas 401) si l'utilisateur est authentifié mais n'a pas
 * le bon rôle — distinction sémantique importante (401 = non authentifié,
 * 403 = authentifié mais non autorisé).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Pas de @Roles() défini → pas de restriction de rôle
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    // user non défini = JwtAuthGuard non appliqué avant ce guard
    if (!user) return false;

    return requiredRoles.includes(user.role);
  }
}