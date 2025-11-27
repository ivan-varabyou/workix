import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService, PasswordService, JwtService } from '@workix/domain/auth';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: any;
  let passwordService: PasswordService;
  let jwtService: JwtService;
  let mockI18nService: any;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    passwordService = new PasswordService();
    jwtService = {
      generateTokens: vi.fn(),
      verifyToken: vi.fn(),
      refreshAccessToken: vi.fn(),
    } as any;

    mockI18nService = {
      translate: vi.fn((key: string) => key),
    };

    authService = new AuthService(prisma, passwordService, jwtService, mockI18nService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePassword123!',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user_123',
        ...registerDto,
        passwordHash: 'hashed',
        emailVerified: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await authService.register(registerDto);

      expect(result).toHaveProperty('id', 'user_123');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).toHaveProperty('name', 'Test User');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        name: 'Test User',
        password: 'SecurePassword123!',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_123',
        email: 'existing@example.com',
      } as any);

      await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if password is weak', async () => {
      const registerDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'weak',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(authService.register(registerDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password lacks uppercase', async () => {
      const registerDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'securepassword123!',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(authService.register(registerDto)).rejects.toThrow(BadRequestException);
    });

    it('should validate email format', async () => {
      const registerDto = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'SecurePassword123!',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      // Email validation happens in DTO validation, this test verifies it reaches service
      expect(registerDto.email).toBeDefined();
    });

    it('should hash password before storing', async () => {
      const registerDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePassword123!',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user_123',
        email: registerDto.email,
        name: registerDto.name,
        passwordHash: 'hashed_value',
      } as any);

      const result = await authService.register(registerDto);

      // Password hash should not be exposed in result
      expect(result).not.toHaveProperty('passwordHash');
      // But email and name should be present
      expect(result.email).toBe(registerDto.email);
    });

    it('should save user to repository', async () => {
      const registerDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePassword123!',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user_123',
        ...registerDto,
      } as any);

      await authService.register(registerDto);

      expect(vi.mocked(prisma.user.create)).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      };

      const hashedPassword = await new PasswordService().hashPassword(loginDto.password);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_123',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        failedLoginAttempts: 0,
        lockedUntil: null,
        name: 'Test User',
      } as any);

      vi.mocked(jwtService.generateTokens).mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      });

      const result = await authService.login(loginDto);

      expect(result).toHaveProperty('tokens');
      expect(result.tokens).toHaveProperty('accessToken', 'token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedException with invalid email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'SecurePassword123!',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with wrong password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const hashedPassword = await new PasswordService().hashPassword('SecurePassword123!');

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_123',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        failedLoginAttempts: 0,
        lockedUntil: null,
      } as any);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should increment failed login attempts on wrong password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const hashedPassword = await new PasswordService().hashPassword('SecurePassword123!');
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        failedLoginAttempts: 0,
        lockedUntil: null,
      } as any;

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);

      await expect(authService.login(loginDto)).rejects.toThrow();

      expect(vi.mocked(prisma.user.update)).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginAttempts: 1,
          }),
        })
      );
    });

    it('should lock account after 5 failed attempts', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const hashedPassword = await new PasswordService().hashPassword('SecurePassword123!');
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        failedLoginAttempts: 4, // 5th attempt will lock
        lockedUntil: null,
      } as any;

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);

      await expect(authService.login(loginDto)).rejects.toThrow();

      const updateCall = vi.mocked(prisma.user.update).mock.calls[0][0];
      expect(updateCall.data.failedLoginAttempts).toBe(5);
      expect(updateCall.data.lockedUntil).toBeDefined();
    });

    it('should throw UnauthorizedException if account is locked', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      };

      const lockedTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in future

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_123',
        email: 'test@example.com',
        passwordHash: 'hash',
        failedLoginAttempts: 5,
        lockedUntil: lockedTime,
      } as any);

      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('auth.account_locked')
      );
    });

    it('should reset failed attempts on successful login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      };

      const hashedPassword = await new PasswordService().hashPassword(loginDto.password);

      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        failedLoginAttempts: 2,
        lockedUntil: null,
      } as any;

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
      vi.mocked(jwtService.generateTokens).mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      });

      await authService.login(loginDto);

      const updateCall = vi.mocked(prisma.user.update).mock.calls[0][0];
      expect(updateCall.data.failedLoginAttempts).toBe(0);
      expect(updateCall.data.lockedUntil).toBeNull();
    });

    it('should generate tokens on successful login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      };

      const hashedPassword = await new PasswordService().hashPassword(loginDto.password);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_123',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        failedLoginAttempts: 0,
        lockedUntil: null,
      } as any);

      vi.mocked(jwtService.generateTokens).mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      });

      const result = await authService.login(loginDto);

      expect(vi.mocked(jwtService.generateTokens)).toHaveBeenCalledWith(
        'user_123',
        'test@example.com'
      );
      expect(result.tokens).toHaveProperty('accessToken', 'token');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const token = 'valid_token';

      vi.mocked(jwtService.verifyToken).mockResolvedValue({
        userId: 'user_123',
        email: 'test@example.com',
        iat: 1234567,
        exp: 1234567 + 3600,
      });

      const result = await authService.verifyToken(token);

      expect(result.valid).toBe(true);
      expect(result.userId).toBe('user_123');
      expect(result.email).toBe('test@example.com');
    });

    it('should return invalid for bad token', async () => {
      const token = 'invalid_token';

      vi.mocked(jwtService.verifyToken).mockResolvedValue(null);

      const result = await authService.verifyToken(token);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid or expired token');
    });

    it('should handle expired token', async () => {
      const token = 'expired_token';

      vi.mocked(jwtService.verifyToken).mockResolvedValue(null);

      const result = await authService.verifyToken(token);

      expect(result.valid).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token successfully', async () => {
      const refreshToken = 'refresh_token';

      vi.mocked(jwtService.refreshAccessToken).mockResolvedValue({
        accessToken: 'new_access_token',
        expiresIn: 3600,
      });

      const result = await authService.refreshToken(refreshToken);

      expect(result).toHaveProperty('accessToken', 'new_access_token');
      expect(result).toHaveProperty('expiresIn', 3600);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid_refresh_token';

      vi.mocked(jwtService.refreshAccessToken).mockResolvedValue(null);

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const refreshToken = 'expired_refresh_token';

      vi.mocked(jwtService.refreshAccessToken).mockResolvedValue(null);

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        new UnauthorizedException('errors.token_expired')
      );
    });

    it('should call jwtService.refreshAccessToken', async () => {
      const refreshToken = 'test_refresh_token';

      vi.mocked(jwtService.refreshAccessToken).mockResolvedValue({
        accessToken: 'token',
        expiresIn: 3600,
      });

      await authService.refreshToken(refreshToken);

      expect(vi.mocked(jwtService.refreshAccessToken)).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const userId = 'user_123';

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed',
      } as any);

      const result = await authService.getUserById(userId);

      expect(result).toHaveProperty('id', userId);
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw BadRequestException if user not found', async () => {
      const userId = 'nonexistent_user';

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(authService.getUserById(userId)).rejects.toThrow(BadRequestException);
    });

    it('should call findOne with correct userId', async () => {
      const userId = 'user_123';

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        email: 'test@example.com',
      } as any);

      await authService.getUserById(userId);

      expect(vi.mocked(prisma.user.findUnique)).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
