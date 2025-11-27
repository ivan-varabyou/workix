import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import * as crypto from 'crypto';

import { I18nAuthService } from '../../interfaces/i18n-auth.interface';
import {
  AuthPrismaService,
  OAuthProvider,
  SocialAccount,
  SocialAccountCreateData,
  User,
  UserCreateData,
} from '../../interfaces/prisma-auth.interface';
import { JwtService } from '../../services/jwt.service';
import { PasswordService } from '../../services/password.service';
import { OAuthLoginResponseDto, OAuthUserInfoDto } from '../dto/oauth-callback.dto';

/**
 * OAuth2 Service
 * Handles OAuth2 login, registration, and account linking
 */
@Injectable()
export class OAuth2Service {
  private readonly logger: Logger = new Logger(OAuth2Service.name);

  private prisma: AuthPrismaService;

  constructor(
    @Optional() @Inject('PrismaService') prisma: AuthPrismaService,
    @Inject(JwtService) private jwtService: JwtService,
    @Inject(PasswordService) private passwordService: PasswordService,
    @Optional() @Inject('I18nService') private i18n?: I18nAuthService
  ) {
    if (!prisma) {
      throw new Error('PrismaService must be provided. Ensure PrismaModule is imported and provides PrismaService globally.');
    }
    this.prisma = prisma;
  }

  // Type assertion for Prisma Client methods
  private get prismaClient(): AuthPrismaService {
    return this.prisma;
  }

  /**
   * Handle OAuth2 login or registration
   * If user exists, link social account
   * If not, create new user with social account
   */
  async handleOAuthLogin(
    provider: 'google' | 'apple' | 'github',
    oauthUserInfo: OAuthUserInfoDto
  ): Promise<OAuthLoginResponseDto> {
    if (!oauthUserInfo.email) {
      throw new BadRequestException(
        this.i18n?.translate('auth.oauth.email_required') || 'Email is required'
      );
    }

    // Validate required fields
    if (!oauthUserInfo.id) {
      throw new BadRequestException('OAuth provider ID is required');
    }
    if (!oauthUserInfo.email) {
      throw new BadRequestException('OAuth email is required');
    }

    // Check if social account already exists
    const normalizedEmail: string = oauthUserInfo.email.toLowerCase();
    let socialAccount: SocialAccount | null = await this.prismaClient.socialAccount.findFirst({
      where: {
        provider: provider,
        providerAccountId: oauthUserInfo.id,
      },
    });

    if (socialAccount) {
      // Social account exists, get user and return tokens
      const user: User | null = await this.prismaClient.user.findUnique({ where: { id: socialAccount.userId } });
      if (user) {
        return this.generateLoginResponse(user);
      }
    }

    // Check if user with this email exists
    let user: User | null = await this.prismaClient.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Create new user
      const newUser: User = await this.createUserFromOAuth(oauthUserInfo);
      user = newUser;
      this.logger.log(`Created new user from ${provider} OAuth: ${user.email}`);
    } else {
      this.logger.log(`Linking ${provider} OAuth account to existing user: ${user.email}`);
    }

    // Validate required fields
    if (!oauthUserInfo.id) {
      throw new BadRequestException('OAuth provider ID is required');
    }
    if (!oauthUserInfo.email) {
      throw new BadRequestException('OAuth email is required');
    }

    if (!user) {
      throw new Error('User is required');
    }

    // Create or update social account
    const socialAccountData: SocialAccountCreateData = {
      provider: provider,
      providerAccountId: oauthUserInfo.id,
      userId: user.id,
      metadata: {
        locale: oauthUserInfo.locale || '',
        emailVerified: oauthUserInfo.emailVerified ?? false,
      },
    };
    if (oauthUserInfo.email !== undefined) {
      socialAccountData.email = oauthUserInfo.email;
    }
    if (oauthUserInfo.name !== undefined) {
      socialAccountData.displayName = oauthUserInfo.name;
    }
    if (oauthUserInfo.picture !== undefined) {
      socialAccountData.profilePicture = oauthUserInfo.picture;
    }

    if (!socialAccount) {
      socialAccount = await this.prismaClient.socialAccount.create({
        data: socialAccountData,
      });
    } else {
      socialAccount = await this.prismaClient.socialAccount.update({
        where: { id: socialAccount.id },
        data: socialAccountData,
      });
    }

    // Mark email as verified if OAuth provider confirms it
    if (user && oauthUserInfo.emailVerified && !user.emailVerified) {
      const updatedUser: User = await this.prismaClient.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
      user = updatedUser;
    }

    if (!user) {
      throw new Error('User is required');
    }

    return this.generateLoginResponse(user);
  }

  /**
   * Create new user from OAuth info
   */
  private async createUserFromOAuth(oauthUserInfo: OAuthUserInfoDto): Promise<User> {
    if (!oauthUserInfo.email) {
      throw new BadRequestException('OAuth email is required');
    }
    const email: string = oauthUserInfo.email.toLowerCase();

    // Generate random password (user can set password later)
    const randomPassword: string = crypto.randomBytes(32).toString('hex');
    const passwordHash: string = await this.passwordService.hashPassword(randomPassword);

    const userCreateData: UserCreateData = {
      email,
      passwordHash,
    };
    const userName: string | undefined = oauthUserInfo.name || email.split('@')[0];
    if (userName) {
      userCreateData.name = userName;
    }
    if (oauthUserInfo.emailVerified !== undefined) {
      userCreateData.emailVerified = oauthUserInfo.emailVerified;
    }
    const user: User = await this.prismaClient.user.create({
      data: userCreateData,
    });

    return user;
  }

  /**
   * Link social account to existing user
   */
  async linkSocialAccount(
    userId: string,
    provider: OAuthProvider,
    oauthUserInfo: OAuthUserInfoDto
  ): Promise<SocialAccount> {
    // Validate required fields
    if (!oauthUserInfo.id) {
      throw new BadRequestException('OAuth provider ID is required');
    }
    if (!oauthUserInfo.email) {
      throw new BadRequestException('OAuth email is required');
    }

    // Get user by userId
    const user: User | null = await this.prismaClient.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if social account already linked
    const existing: SocialAccount | null = await this.prismaClient.socialAccount.findFirst({
      where: {
        provider: provider,
        providerAccountId: oauthUserInfo.id,
      },
    });

    if (existing) {
      throw new ConflictException(`This ${provider} account is already linked to another user`);
    }

    const socialAccountData: SocialAccountCreateData = {
      provider: provider,
      providerAccountId: oauthUserInfo.id,
      userId: user.id,
      metadata: {
        locale: oauthUserInfo.locale || '',
        emailVerified: oauthUserInfo.emailVerified ?? false,
      },
    };

    const socialAccount: SocialAccount = await this.prismaClient.socialAccount.create({
      data: socialAccountData,
    });

    return socialAccount;
  }

  /**
   * Unlink social account from user
   */
  async unlinkSocialAccount(userId: string, provider: OAuthProvider): Promise<void> {
    const socialAccount: SocialAccount | null = await this.prismaClient.socialAccount.findFirst({
      where: {
        userId,
        provider: provider,
      },
    });

    if (!socialAccount) {
      throw new BadRequestException(`${provider} account is not linked to this user`);
    }

    // Ensure user has password (can't unlink if no password and only social account)
    const user: User | null = await this.prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash || user.passwordHash === '') {
      throw new BadRequestException(
        this.i18n?.translate('auth.oauth.cannot_unlink_no_password') ||
          'Cannot unlink account without password'
      );
    }

    await this.prismaClient.socialAccount.delete({
      where: { id: socialAccount.id },
    });
    this.logger.log(`Unlinked ${provider} account from user ${userId}`);
  }

  /**
   * Get user's linked social accounts
   */
  async getUserSocialAccounts(userId: string): Promise<
    Array<{
      id: string;
      provider: OAuthProvider;
      email: string | null;
      displayName: string | null;
      profilePicture: string | null;
      createdAt: Date;
    }>
  > {
    const accounts: Array<{
      id: string;
      provider: OAuthProvider;
      email: string | null;
      displayName: string | null;
      profilePicture: string | null;
      createdAt: Date;
    }> = await this.prismaClient.socialAccount.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        email: true,
        displayName: true,
        profilePicture: true,
        createdAt: true,
      },
    });
    return accounts.map(
      (
        account: {
          id: string;
          provider: OAuthProvider;
          email: string | null;
          displayName: string | null;
          profilePicture: string | null;
          createdAt: Date;
        }
      ): {
        id: string;
        provider: OAuthProvider;
        email: string | null;
        displayName: string | null;
        profilePicture: string | null;
        createdAt: Date;
      } => ({
        id: account.id,
        provider: account.provider,
        email: account.email ?? null,
        displayName: account.displayName ?? null,
        profilePicture: account.profilePicture ?? null,
        createdAt: account.createdAt,
      })
    );
  }

  /**
   * Generate login response with tokens
   */
  private async generateLoginResponse(user: User): Promise<OAuthLoginResponseDto> {
    const tokens: { accessToken: string; refreshToken: string; expiresIn: number } = await this.jwtService.generateTokens(user.id, user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? '',
      },
    };
  }
}
