import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * JWT Strategy
 * Extracts and validates JWT from requests
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // Get JWT secret from environment (no default values for security)
    // Note: Cannot use ConfigService here because super() must be called first
    // Validation is done in WorkixAuthModule.forRoot() via validateAuthConfig()
    // eslint-disable-next-line no-restricted-globals, no-restricted-syntax
    const jwtSecret: string | undefined = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 32) {
      throw new Error(
        'JWT_SECRET is required and must be at least 32 characters long. ' +
          'Please set it in your environment variables.'
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret, // No default - throws error if not set
    });
  }

  async validate(payload: JwtPayload): Promise<{ userId: string; email: string }> {
    return {
      userId: payload.userId,
      email: payload.email,
    };
  }
}
