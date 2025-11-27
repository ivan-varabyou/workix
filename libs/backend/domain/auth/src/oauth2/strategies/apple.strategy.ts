import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { HttpRequest } from '@workix/shared/backend/core';
import { Strategy } from 'passport-apple';

import { AppleIdToken, OAuthProfile } from '../../interfaces/oauth-profile.interface';
import { OAuthUserInfoDto } from '../dto/oauth-callback.dto';

/**
 * Apple Sign-In Strategy
 * Passport strategy for Apple Sign-In authentication
 */
@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(@Inject(ConfigService) configService: ConfigService) {
    const clientID: string | undefined = configService.get('APPLE_CLIENT_ID');
    const teamID: string | undefined = configService.get('APPLE_TEAM_ID');
    const keyID: string | undefined = configService.get('APPLE_KEY_ID');
    const key: string | undefined = configService.get('APPLE_PRIVATE_KEY');

    // Only initialize if credentials are provided
    // Type assertion needed for passport-apple Strategy constructor

    const strategyOptions: ConstructorParameters<typeof Strategy>[0] = (!clientID || !teamID || !keyID || !key)
      ? {
          clientID: 'dummy',
          teamID: 'dummy',
          keyID: 'dummy',
          privateKeyString: 'dummy',
          callbackURL: 'http://localhost:7000/api/auth/oauth/apple/callback',
          scope: ['email', 'name'],
          passReqToCallback: true,
        }
      : {
          clientID,
          teamID,
          keyID,
          privateKeyString: key,
          callbackURL:
            configService.get('APPLE_CALLBACK_URL') ||
            'http://localhost:7000/api/auth/oauth/apple/callback',
          scope: ['email', 'name'],
          passReqToCallback: true,
        };
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    super(strategyOptions as unknown as ConstructorParameters<typeof Strategy>[0]);
  }

  async validate(
    _req: HttpRequest,
    _accessToken: string,
    _refreshToken: string,
    idToken: AppleIdToken,
    profile: OAuthProfile
  ): Promise<OAuthUserInfoDto> {
    const emailValue: string | undefined = idToken.email;
    if (!emailValue || typeof emailValue !== 'string') {
      throw new Error('Email is required for Apple OAuth authentication');
    }

    const displayName: string | undefined = profile.displayName;
    const nameValue: string | undefined = typeof displayName === 'string' ? displayName : undefined;
    const emailName: string = emailValue.split('@')[0] || '';
    const finalName: string = nameValue || emailName || 'Apple User';

    const userInfo: OAuthUserInfoDto = {
      id: idToken.sub,
      email: emailValue,
      name: finalName,
      emailVerified: idToken.email_verified ?? false,
    };
    return userInfo;
  }
}
