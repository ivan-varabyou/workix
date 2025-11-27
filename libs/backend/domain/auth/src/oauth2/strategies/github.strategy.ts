import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

import { OAuthProfile } from '../../interfaces/oauth-profile.interface';
import { OAuthUserInfoDto } from '../dto/oauth-callback.dto';

/**
 * GitHub OAuth2 Strategy
 * Passport strategy for GitHub OAuth2 authentication
 */
@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(@Inject(ConfigService) configService: ConfigService) {
    const clientID: string | undefined = configService.get('GITHUB_CLIENT_ID');
    const clientSecret: string | undefined = configService.get('GITHUB_CLIENT_SECRET');

    // Only initialize if credentials are provided
    if (!clientID || !clientSecret) {
      super({
        clientID: 'dummy',
        clientSecret: 'dummy',
        callbackURL: 'http://localhost:7000/api/auth/oauth/github/callback',
        scope: ['user:email'],
      });
    } else {
      super({
        clientID,
        clientSecret,
        callbackURL:
          configService.get('GITHUB_CALLBACK_URL') ||
          'http://localhost:7000/api/auth/oauth/github/callback',
        scope: ['user:email'],
      });
    }
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: OAuthProfile
  ): Promise<OAuthUserInfoDto> {
    const emailValue: string | undefined = profile.emails?.[0]?.value;
    const usernameRaw: unknown = profile.username;
    const usernameValue: string | undefined = typeof usernameRaw === 'string' ? usernameRaw : undefined;

    let email: string;
    if (emailValue && typeof emailValue === 'string') {
      email = emailValue;
    } else if (usernameValue && typeof usernameValue === 'string') {
      email = `${usernameValue}@github.com`;
    } else {
      throw new Error('Email or username is required for GitHub OAuth authentication');
    }

    const displayName: string | undefined = profile.displayName;
    const nameValue: string | undefined = typeof displayName === 'string' ? displayName : undefined;
    const finalName: string =
      nameValue || (typeof usernameValue === 'string' ? usernameValue : 'GitHub User');

    const photoValue: string | undefined = profile.photos?.[0]?.value;
    const pictureValue: string | undefined = typeof photoValue === 'string' ? photoValue : undefined;

    const profileId: string | number | undefined = profile.id;
    const idString: string = typeof profileId === 'string' ? profileId : String(profileId);

    const userInfo: OAuthUserInfoDto = {
      id: idString,
      email,
      name: finalName,
      emailVerified: profile.emails?.[0]?.verified ?? false,
    };
    if (pictureValue !== undefined) {
      userInfo.picture = pictureValue;
    }
    return userInfo;
  }
}
