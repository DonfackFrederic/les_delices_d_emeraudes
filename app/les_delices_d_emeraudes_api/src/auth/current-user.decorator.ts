import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

/**
 * Extrait l'utilisateur authentifié de la requête (peuplé par JwtStrategy).
 *
 * Avec JwtAuthGuard          → toujours défini.
 * Avec OptionalJwtAuthGuard  → peut être `null` (mode invité).
 *
 * Usage :
 *   create(@CurrentUser() user: AuthenticatedUser | null) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user ?? null;
  },
);