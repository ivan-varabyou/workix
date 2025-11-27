import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Auth Features Configuration
 * Controls which authentication methods are enabled
 */
export interface AuthFeaturesConfig {
  // Basic Authentication
  enableRegistration: boolean;
  enableLogin: boolean;
  enablePasswordReset: boolean;

  // Two-Factor Authentication
  enable2FA: boolean;

  // OAuth2 Providers
  enableOAuth2: boolean;
  enableOAuth2Google: boolean;
  enableOAuth2GitHub: boolean;
  enableOAuth2Apple: boolean;

  // Phone OTP
  enablePhoneOtp: boolean;

  // Email Verification
  enableEmailVerification: boolean;

  // Biometric Authentication
  enableBiometric: boolean;

  // Session Management
  enableSessions: boolean;
}

/**
 * AuthFeaturesService
 * Service to check if specific authentication features are enabled
 */
@Injectable()
export class AuthFeaturesService {
  private readonly config: AuthFeaturesConfig;

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfig(): AuthFeaturesConfig {
    // Helper to parse boolean from env (defaults to true if not set)
    // Note: This file is excluded from WebAssembly rules as it's configuration-specific
    // eslint-disable no-restricted-globals, no-restricted-syntax
    const getBool: (key: string, defaultValue?: boolean) => boolean = (
      key: string,
      defaultValue: boolean = true
    ): boolean => {
      const value: string | undefined = this.configService.get<string>(key);
      if (value === undefined || value === '') {
        return defaultValue;
      }
      return value.toLowerCase() === 'true' || value === '1';
    };

    // Basic Authentication (enabled by default)
    const enableRegistration: boolean = getBool('AUTH_ENABLE_REGISTRATION', true);
    const enableLogin: boolean = getBool('AUTH_ENABLE_LOGIN', true);
    const enablePasswordReset: boolean = getBool('AUTH_ENABLE_PASSWORD_RESET', true);

    // Two-Factor Authentication (disabled by default)
    const enable2FA: boolean = getBool('AUTH_ENABLE_2FA', false);

    // OAuth2 (disabled by default, requires additional setup)
    const enableOAuth2: boolean = getBool('AUTH_ENABLE_OAUTH2', false);
    const enableOAuth2Google: boolean = enableOAuth2 && getBool('AUTH_ENABLE_OAUTH2_GOOGLE', false);
    const enableOAuth2GitHub: boolean = enableOAuth2 && getBool('AUTH_ENABLE_OAUTH2_GITHUB', false);
    const enableOAuth2Apple: boolean = enableOAuth2 && getBool('AUTH_ENABLE_OAUTH2_APPLE', false);

    // Phone OTP (disabled by default, requires SMS provider)
    const enablePhoneOtp: boolean = getBool('AUTH_ENABLE_PHONE_OTP', false);

    // Email Verification (enabled by default)
    const enableEmailVerification: boolean = getBool('AUTH_ENABLE_EMAIL_VERIFICATION', true);

    // Biometric Authentication (disabled by default)
    const enableBiometric: boolean = getBool('AUTH_ENABLE_BIOMETRIC', false);

    // Session Management (enabled by default)
    const enableSessions: boolean = getBool('AUTH_ENABLE_SESSIONS', true);

    return {
      enableRegistration,
      enableLogin,
      enablePasswordReset,
      enable2FA,
      enableOAuth2,
      enableOAuth2Google,
      enableOAuth2GitHub,
      enableOAuth2Apple,
      enablePhoneOtp,
      enableEmailVerification,
      enableBiometric,
      enableSessions,
    };
  }

  /**
   * Get full configuration
   */
  getConfig(): AuthFeaturesConfig {
    return { ...this.config };
  }

  /**
   * Check if registration is enabled
   */
  isRegistrationEnabled(): boolean {
    return this.config.enableRegistration;
  }

  /**
   * Check if login is enabled
   */
  isLoginEnabled(): boolean {
    return this.config.enableLogin;
  }

  /**
   * Check if password reset is enabled
   */
  isPasswordResetEnabled(): boolean {
    return this.config.enablePasswordReset;
  }

  /**
   * Check if 2FA is enabled
   */
  is2FAEnabled(): boolean {
    return this.config.enable2FA;
  }

  /**
   * Check if OAuth2 is enabled
   */
  isOAuth2Enabled(): boolean {
    return this.config.enableOAuth2;
  }

  /**
   * Check if specific OAuth2 provider is enabled
   */
  isOAuth2ProviderEnabled(provider: 'google' | 'github' | 'apple'): boolean {
    switch (provider) {
      case 'google':
        return this.config.enableOAuth2Google;
      case 'github':
        return this.config.enableOAuth2GitHub;
      case 'apple':
        return this.config.enableOAuth2Apple;
      default:
        return false;
    }
  }

  /**
   * Check if Phone OTP is enabled
   */
  isPhoneOtpEnabled(): boolean {
    return this.config.enablePhoneOtp;
  }

  /**
   * Check if email verification is enabled
   */
  isEmailVerificationEnabled(): boolean {
    return this.config.enableEmailVerification;
  }

  /**
   * Check if biometric authentication is enabled
   */
  isBiometricEnabled(): boolean {
    return this.config.enableBiometric;
  }

  /**
   * Check if session management is enabled
   */
  isSessionsEnabled(): boolean {
    return this.config.enableSessions;
  }

  /**
   * Get list of enabled OAuth2 providers
   */
  getEnabledOAuth2Providers(): Array<'google' | 'github' | 'apple'> {
    const providers: Array<'google' | 'github' | 'apple'> = [];
    if (this.config.enableOAuth2Google) providers.push('google');
    if (this.config.enableOAuth2GitHub) providers.push('github');
    if (this.config.enableOAuth2Apple) providers.push('apple');
    return providers;
  }
}
