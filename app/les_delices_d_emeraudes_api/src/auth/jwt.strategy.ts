import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { createClient } from '@supabase/supabase-js';

/**
 * Validation des JWT Supabase via JWKS (clé publique).
 *
 * Pourquoi ce changement (vs l'ancienne version HS256 + secret partagé) :
 * Le projet Supabase a effectué une rotation de ses clés de signature
 * (visible dans Settings > API > JWT Signing Keys : "Current key" est
 * maintenant ECC P-256, l'ancien secret HS256 est listé sous
 * "Previously used keys"). Tous les NOUVEAUX tokens (chaque connexion,
 * chaque refresh) sont donc signés en ES256 — un secret HMAC partagé
 * ne peut plus les valider, peu importe sa valeur exacte.
 *
 * jwks-rsa (malgré son nom) gère aussi les clés EC : il lit le `kid`
 * présent dans le header du JWT, va chercher la clé PUBLIQUE
 * correspondante sur l'endpoint JWKS du projet, et la fournit à
 * passport-jwt pour vérifier la signature. Aucun secret à stocker côté
 * backend — uniquement la vérification, jamais la capacité de signer.
 *
 * JWT_SIGNING_KEYS_URL = https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private supabase;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,

      // Supabase signe désormais en ES256 (clé asymétrique). On valide via
      // la clé publique exposée par le projet, récupérée dynamiquement
      // selon le `kid` du token — fonctionne aussi pendant la période de
      // transition où d'anciens tokens HS256 encore valides circulent
      // (Supabase expose les deux familles de clés sur le même JWKS tant
      // que l'ancienne clé n'est pas révoquée).
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      }),

      // Tous les tokens Supabase ont aud: "authenticated"
      audience: 'authenticated',

      algorithms: ['ES256', 'HS256'], // accepte les deux pendant la transition
    });

    this.supabase = createClient(
      configService.get<string>('SUPABASE_URL')!,
      configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  async validate(payload: any) {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', payload.sub)
      .single();

    if (error || !user) throw new UnauthorizedException();
    return user; // injecté dans req.user
  }
}