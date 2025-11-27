// Main Module
export * from './auth.module';

// Configuration
export * from './config/auth-config.schema';
export * from './config/auth-config.service';
export * from './config/auth-features.config';

// Services
export * from './email-verification/services/email-verification.service';
export * from './oauth2/services/oauth2.service';
export * from './phone-otp/services/phone-otp.service';
export * from './services/auth.service';
export * from './services/biometric.service';
export * from './services/jwt.service';
export * from './services/password.service';
export * from './services/password-reset.service';
export * from './services/refresh-token-blacklist.service';
export * from './services/session.service';
export * from './services/two-factor.service';

// Security
export * from './security/middleware/security-threat.middleware';
export * from './security/security.module';
export * from './security/services/account-security.service';
export * from './security/services/data-cleanup.service';
export * from './security/services/data-cleanup-scheduler.service';
export * from './security/services/geolocation.service';
export * from './security/services/injection-detector.service';
export * from './security/services/ip-blocking.service';
export * from './security/services/security-code.service';
export * from './security/services/threat-detection.service';

// Guards
export * from './guards/jwt.guard';

// Decorators
export * from './decorators/current-user.decorator';
export * from './decorators/public.decorator';

// Strategies
export * from './oauth2/strategies/apple.strategy';
export * from './oauth2/strategies/github.strategy';
export * from './oauth2/strategies/google.strategy';
export * from './strategies/jwt.strategy';

// DTOs
export * from './dto/auth-response.dto';
export * from './dto/biometric.dto';
export * from './dto/login.dto';
export * from './dto/password-reset.dto';
export * from './dto/register.dto';
export * from './dto/session.dto';
export * from './dto/two-factor.dto';
export * from './email-verification/dto/email-verification.dto';
export * from './oauth2/dto/oauth-callback.dto';
export * from './phone-otp/dto/phone-otp.dto';

// Interfaces
export * from './interfaces/jwt-payload.interface';
export * from './interfaces/oauth-profile.interface';
export type { AuthPrismaService } from './interfaces/prisma-auth.interface';

// Validators
export * from './validators/email.validator';
export * from './validators/email-security.validator';
export * from './validators/name-security.validator';

// Sub-modules
export * from './email-verification/email-verification.module';
export * from './oauth2/oauth2.module';
export * from './phone-otp/phone-otp.module';

// Re-export DTOs with aliases for convenience
export {
  PasswordResetResponseDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  ResetPasswordResponseDto,
  VerifyResetTokenDto,
  VerifyTokenResponseDto,
} from './dto/password-reset.dto';
export {
  EmailVerificationResponseDto,
  EmailVerifiedResponseDto,
  EmailVerifiedUserInfoDto,
  GetVerificationStatusResponseDto,
  ResendVerificationEmailDto,
  SendVerificationEmailDto,
  VerifyEmailDto,
} from './email-verification/dto/email-verification.dto';
export {
  OAuthCallbackDto,
  OAuthLoginResponseDto,
  OAuthUserInfoDto,
  OAuthUserInfoResponseDto,
  SocialAccountDto,
  UnlinkSocialAccountResponseDto,
} from './oauth2/dto/oauth-callback.dto';
export {
  PhoneOtpResponseDto,
  PhoneOtpUserInfoDto,
  PhoneOtpVerifyResponseDto,
  SendPhoneOtpDto,
  VerifyPhoneOtpDto,
} from './phone-otp/dto/phone-otp.dto';
