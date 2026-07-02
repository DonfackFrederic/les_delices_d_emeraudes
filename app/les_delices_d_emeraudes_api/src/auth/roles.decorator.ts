import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@shared/types';

export const ROLES_KEY = 'roles';

/**
 * Décore un controller ou une route avec les rôles autorisés.
 * Utilisé conjointement avec RolesGuard.
 *
 * Usage :
 *   @Roles('admin')
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Controller('admin/categories')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);