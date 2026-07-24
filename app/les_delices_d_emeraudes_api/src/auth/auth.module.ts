import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';

/**
 * Module d'authentification.
 *
 * PassportModule.register({ defaultStrategy: 'jwt' }) déclenche
 * l'enregistrement de toute stratégie Passport instanciée dans ce module
 * (ici JwtStrategy, qui hérite de PassportStrategy(Strategy) avec le nom
 * implicite 'jwt' — c'est ce nom que AuthGuard('jwt') recherche).
 *
 * Sans ce module (ou sans que JwtStrategy soit fournie dans un module
 * important PassportModule), Passport ne connaît aucune stratégie nommée
 * 'jwt', d'où l'erreur "Unknown authentication strategy jwt".
 */
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [JwtStrategy, JwtAuthGuard, OptionalJwtAuthGuard],
  exports: [JwtAuthGuard, OptionalJwtAuthGuard, PassportModule],
})
export class AuthModule {}