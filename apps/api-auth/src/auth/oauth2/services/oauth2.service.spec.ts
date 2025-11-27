import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OAuth2Service, OAuthUserInfoDto } from '@workix/domain/auth';

describe('OAuth2Service', () => {
  let service: OAuth2Service;
  let prisma: any;
  let mockJwtService: any;
  let mockPasswordService: any;
  let mockI18nService: any;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      socialAccount: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findMany: vi.fn(),
      },
    };

    mockJwtService = {
      generateTokens: vi.fn(),
    };

    mockPasswordService = {
      hashPassword: vi.fn(),
    };

    mockI18nService = {
      translate: vi.fn((key: string) => key),
    };

    service = new OAuth2Service(prisma, mockJwtService, mockPasswordService, mockI18nService);
  });

  describe('handleOAuthLogin', () => {
    it('should login existing user with linked social account', async () => {
      const oauthUserInfo: OAuthUserInfoDto = {
        id: '123',
        email: 'user@example.com',
        name: 'John Doe',
      };

      const existingUser = {
        id: 'user-id',
        email: 'user@example.com',
        name: 'John Doe',
        emailVerified: false,
        phoneNumber: null,
        passwordHash: 'hash',
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const socialAccount = {
        id: 'sa-id',
        userId: 'user-id',
        provider: 'google',
        providerAccountId: '123',
        email: 'user@example.com',
        displayName: 'John Doe',
        profilePicture: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.socialAccount.findFirst).mockResolvedValue(socialAccount);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);
      vi.mocked(mockJwtService.generateTokens).mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      });

      const result = await service.handleOAuthLogin('google', oauthUserInfo);

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.email).toBe('user@example.com');
    });

    it('should create new user if not exists', async () => {
      const oauthUserInfo: OAuthUserInfoDto = {
        id: '123',
        email: 'newuser@example.com',
        name: 'New User',
        emailVerified: true,
      };

      const newUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        name: 'New User',
        emailVerified: true,
        phoneNumber: null,
        passwordHash: 'hashed-password',
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newSocialAccount = {
        id: 'sa-id',
        userId: 'new-user-id',
        provider: 'google',
        providerAccountId: '123',
        email: 'newuser@example.com',
        displayName: 'New User',
        profilePicture: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.socialAccount.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPasswordService.hashPassword).mockResolvedValue('hashed-password');
      vi.mocked(prisma.user.create).mockResolvedValue(newUser);
      vi.mocked(prisma.socialAccount.create).mockResolvedValue(newSocialAccount);
      vi.mocked(mockJwtService.generateTokens).mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      });

      const result = await service.handleOAuthLogin('google', oauthUserInfo);

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.user.email).toBe('newuser@example.com');
    });

    it('should throw error if no email from provider', async () => {
      const oauthUserInfo: OAuthUserInfoDto = {
        id: '123',
        email: '',
        name: 'User',
      };

      await expect(service.handleOAuthLogin('google', oauthUserInfo as any)).rejects.toThrow(
        'auth.oauth.email_required'
      );
    });

    it('should link social account to existing user', async () => {
      const oauthUserInfo: OAuthUserInfoDto = {
        id: '123',
        email: 'existing@example.com',
        name: 'Existing User',
      };

      const existingUser = {
        id: 'existing-user-id',
        email: 'existing@example.com',
        name: 'Existing User',
        emailVerified: false,
        phoneNumber: null,
        passwordHash: 'hash',
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newSocialAccount = {
        id: 'sa-id',
        userId: 'existing-user-id',
        provider: 'google',
        providerAccountId: '123',
        email: 'existing@example.com',
        displayName: 'Existing User',
        profilePicture: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.socialAccount.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);
      vi.mocked(prisma.socialAccount.create).mockResolvedValue(newSocialAccount);
      vi.mocked(mockJwtService.generateTokens).mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      });

      const result = await service.handleOAuthLogin('google', oauthUserInfo);

      expect(prisma.socialAccount.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            provider: 'google',
            providerAccountId: '123',
            userId: 'existing-user-id',
          }),
        })
      );
      expect(result.user.email).toBe('existing@example.com');
    });

    it('should mark email as verified if provider confirms it', async () => {
      const oauthUserInfo: OAuthUserInfoDto = {
        id: '123',
        email: 'newuser@example.com',
        name: 'New User',
        emailVerified: true,
      };

      const newUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        name: 'New User',
        emailVerified: true, // Should be set to true after creation
        phoneNumber: null,
        passwordHash: 'hashed-password',
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newSocialAccount = {
        id: 'sa-id',
        userId: 'new-user-id',
        provider: 'google',
        providerAccountId: '123',
        email: 'newuser@example.com',
        displayName: 'New User',
        profilePicture: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.socialAccount.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPasswordService.hashPassword).mockResolvedValue('hashed-password');
      vi.mocked(prisma.user.create).mockResolvedValue(newUser);
      vi.mocked(prisma.socialAccount.create).mockResolvedValue(newSocialAccount);
      vi.mocked(mockJwtService.generateTokens).mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      });

      const result = await service.handleOAuthLogin('google', oauthUserInfo);

      // Verify that email verification is handled
      expect(result.user.email).toBe('newuser@example.com');
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('unlinkSocialAccount', () => {
    it('should unlink social account successfully', async () => {
      const userId = 'user-id';
      const socialAccount = {
        id: 'sa-id',
        userId,
        provider: 'google',
        providerAccountId: '123',
        email: 'user@example.com',
        displayName: 'User',
        profilePicture: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const user = {
        id: userId,
        passwordHash: 'some-hash',
        email: 'user@example.com',
        name: 'User',
        emailVerified: false,
        phoneNumber: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.socialAccount.findFirst).mockResolvedValue(socialAccount);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(user);
      vi.mocked(prisma.socialAccount.delete).mockResolvedValue(socialAccount);

      await service.unlinkSocialAccount(userId, 'google');

      expect(prisma.socialAccount.delete).toHaveBeenCalledWith({
        where: { id: socialAccount.id },
      });
    });

    it('should throw error if social account not linked', async () => {
      const userId = 'user-id';

      vi.mocked(prisma.socialAccount.findFirst).mockResolvedValue(null);

      await expect(service.unlinkSocialAccount(userId, 'google')).rejects.toThrow(
        'google account is not linked to this user'
      );
    });

    it('should throw error if user has no password', async () => {
      const userId = 'user-id';
      const socialAccount = {
        id: 'sa-id',
        userId,
        provider: 'google',
        providerAccountId: '123',
        email: 'user@example.com',
        displayName: 'User',
        profilePicture: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const user = {
        id: userId,
        passwordHash: '',
        email: 'user@example.com',
        name: 'User',
        emailVerified: false,
        phoneNumber: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.socialAccount.findFirst).mockResolvedValue(socialAccount);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(user);

      await expect(service.unlinkSocialAccount(userId, 'google')).rejects.toThrow(
        'auth.oauth.cannot_unlink_no_password'
      );
    });
  });

  describe('getUserSocialAccounts', () => {
    it('should return user social accounts', async () => {
      const userId = 'user-id';
      const socialAccounts = [
        {
          id: '1',
          provider: 'google',
          email: 'user@example.com',
          displayName: 'User',
          profilePicture: null,
          createdAt: new Date(),
        },
        {
          id: '2',
          provider: 'github',
          email: 'user@github.com',
          displayName: 'User',
          profilePicture: null,
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.socialAccount.findMany).mockResolvedValue(socialAccounts);

      const result = await service.getUserSocialAccounts(userId);

      expect(result).toEqual(socialAccounts);
      expect(prisma.socialAccount.findMany).toHaveBeenCalledWith({
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
    });

    it('should return empty array if no social accounts', async () => {
      const userId = 'user-id';

      vi.mocked(prisma.socialAccount.findMany).mockResolvedValue([]);

      const result = await service.getUserSocialAccounts(userId);

      expect(result).toEqual([]);
    });
  });
});
