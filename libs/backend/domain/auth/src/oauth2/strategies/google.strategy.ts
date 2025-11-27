import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

import { OAuthProfile } from '../../interfaces/oauth-profile.interface';
import { OAuthUserInfoDto } from '../dto/oauth-callback.dto';

/**
 * Google OAuth2 Strategy
 * Passport strategy for Google OAuth2 authentication
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(@Inject(ConfigService) configService: ConfigService) {
    const clientID: string | undefined = configService.get('GOOGLE_CLIENT_ID');
    const clientSecret: string | undefined = configService.get('GOOGLE_CLIENT_SECRET');

    // Only initialize if credentials are provided
    if (!clientID || !clientSecret) {
      super({
        clientID: 'dummy',
        clientSecret: 'dummy',
        callbackURL: 'http://localhost:7000/api/auth/oauth/google/callback',
        scope: ['email', 'profile'],
      });
    } else {
      super({
        clientID,
        clientSecret,
        callbackURL:
          configService.get('GOOGLE_CALLBACK_URL') ||
          'http://localhost:7000/api/auth/oauth/google/callback',
        scope: ['email', 'profile'],
      });
    }
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: OAuthProfile
  ): Promise<OAuthUserInfoDto> {
    const emailValue: string | undefined = profile.emails?.[0]?.value;
    if (!emailValue || typeof emailValue !== 'string') {
      throw new Error('Email is required for Google OAuth authentication');
    }

    const displayName: string | undefined = profile.displayName;
    const nameValue: string | undefined = typeof displayName === 'string' ? displayName : undefined;
    const photoValue: string | undefined = profile.photos?.[0]?.value;
    const pictureValue: string | undefined = typeof photoValue === 'string' ? photoValue : undefined;

    const profileJson: unknown = '_json' in profile ? profile._json : null;
    const localeValue: unknown =
      profileJson && typeof profileJson === 'object' && 'locale' in profileJson
        ? profileJson.locale
        : null;
    const localeString: string | undefined = typeof localeValue === 'string' ? localeValue : undefined;

    const userInfo: OAuthUserInfoDto = {
      id: profile.id,
      email: emailValue,
      emailVerified: profile.emails?.[0]?.verified ?? false,
    };
    if (nameValue !== undefined) {
      userInfo.name = nameValue;
    }
    if (pictureValue !== undefined) {
      userInfo.picture = pictureValue;
    }
    if (localeString !== undefined) {
      userInfo.locale = localeString;
    }
    return userInfo;
  }
}
