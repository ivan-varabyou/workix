import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JwtService } from '@workix/domain/auth';
import { JwtService as NestJwtService } from '@nestjs/jwt';

describe('JwtService', () => {
  let service: JwtService;
  let nestJwtService: NestJwtService;

  beforeEach(() => {
    // Mock NestJS JwtService
    nestJwtService = {
      signAsync: vi.fn(),
      verifyAsync: vi.fn(),
    } as any;

    service = new JwtService(nestJwtService);
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const userId = 'user_123';
      const email = 'test@example.com';

      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('access_token_xxx');
      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('refresh_token_xxx');

      const result = await service.generateTokens(userId, email);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('access_token_xxx');
      expect(result.refreshToken).toBe('refresh_token_xxx');
      expect(result.expiresIn).toBe(3600);
    });

    it('should sign with correct payload for access token', async () => {
      const userId = 'user_123';
      const email = 'test@example.com';

      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('token');
      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('token');

      await service.generateTokens(userId, email);

      // Check first call (access token)
      const firstCall = vi.mocked(nestJwtService.signAsync).mock.calls[0];
      expect(firstCall).toBeDefined();
      if (firstCall) {
        expect(firstCall[0]).toHaveProperty('userId', userId);
        expect(firstCall[0]).toHaveProperty('email', email);
        expect(firstCall[1]).toHaveProperty('expiresIn', '1h');
      }
    });

    it('should sign with correct payload for refresh token', async () => {
      const userId = 'user_123';
      const email = 'test@example.com';

      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('token');
      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('token');

      await service.generateTokens(userId, email);

      // Check second call (refresh token)
      const secondCall = vi.mocked(nestJwtService.signAsync).mock.calls[1];
      expect(secondCall).toBeDefined();
      if (secondCall) {
        expect(secondCall[0]).toHaveProperty('userId', userId);
        expect(secondCall[0]).toHaveProperty('email', email);
        expect(secondCall[1]).toHaveProperty('expiresIn', '7d');
      }
    });

    it('should generate different tokens each time', async () => {
      const userId = 'user_123';
      const email = 'test@example.com';

      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('token_1');
      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('token_2');

      const result1 = await service.generateTokens(userId, email);

      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('token_3');
      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('token_4');

      const result2 = await service.generateTokens(userId, email);

      expect(result1.accessToken).not.toBe(result2.accessToken);
      expect(result1.refreshToken).not.toBe(result2.refreshToken);
    });

    it('should handle special characters in email', async () => {
      const userId = 'user_123';
      const email = 'test+tag@example.co.uk';

      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('token');
      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('token');

      const result = await service.generateTokens(userId, email);

      expect(result).toBeDefined();
      const firstCall = vi.mocked(nestJwtService.signAsync).mock.calls[0];
      expect(firstCall).toBeDefined();
      if (firstCall) {
        expect(firstCall[0]).toHaveProperty('email', email);
      }
    });

    it('should include userId and email in payload', async () => {
      const userId = 'user_123';
      const email = 'test@example.com';

      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('token');
      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('token');

      await service.generateTokens(userId, email);

      const firstCall = vi.mocked(nestJwtService.signAsync).mock.calls[0];
      expect(firstCall).toBeDefined();
      if (firstCall) {
        const payload = firstCall[0] as Record<string, unknown>;
        expect(payload).toHaveProperty('userId', userId);
        expect(payload).toHaveProperty('email', email);
        // Note: iat and exp are added automatically by jsonwebtoken library
        // They are not part of the payload we pass, but are added during signing
      }
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const payload = {
        userId: 'user_123',
        email: 'test@example.com',
        iat: 1234567,
        exp: 1234567 + 3600,
      };

      vi.mocked(nestJwtService.verifyAsync).mockResolvedValueOnce(payload);

      const result = await service.verifyToken('valid_token');

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result).toEqual(payload);
      expect(result!.userId).toBe('user_123');
      expect(result!.email).toBe('test@example.com');
    });

    it('should return null for invalid token', async () => {
      vi.mocked(nestJwtService.verifyAsync).mockRejectedValueOnce(new Error('Invalid token'));

      const result = await service.verifyToken('invalid_token');

      expect(result).toBeNull();
    });

    it('should return null for expired token', async () => {
      vi.mocked(nestJwtService.verifyAsync).mockRejectedValueOnce(new Error('Token expired'));

      const result = await service.verifyToken('expired_token');

      expect(result).toBeNull();
    });

    it('should return null for malformed token', async () => {
      vi.mocked(nestJwtService.verifyAsync).mockRejectedValueOnce(new Error('Malformed token'));

      const result = await service.verifyToken('not.a.token');

      expect(result).toBeNull();
    });

    it('should handle empty token', async () => {
      vi.mocked(nestJwtService.verifyAsync).mockRejectedValueOnce(new Error('Empty token'));

      const result = await service.verifyToken('');

      expect(result).toBeNull();
    });

    it('should call verifyAsync with correct token', async () => {
      const token = 'test_token_123';
      vi.mocked(nestJwtService.verifyAsync).mockResolvedValueOnce({});

      await service.verifyToken(token);

      expect(vi.mocked(nestJwtService.verifyAsync)).toHaveBeenCalledWith(token);
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token from refresh token', async () => {
      const refreshPayload = {
        userId: 'user_123',
        email: 'test@example.com',
      };

      vi.mocked(nestJwtService.verifyAsync).mockResolvedValueOnce(refreshPayload);
      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('new_access_token');

      const result = await service.refreshAccessToken('refresh_token');

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.accessToken).toBe('new_access_token');
      expect(result!.expiresIn).toBe(3600);
    });

    it('should return null for invalid refresh token', async () => {
      vi.mocked(nestJwtService.verifyAsync).mockRejectedValueOnce(
        new Error('Invalid refresh token')
      );

      const result = await service.refreshAccessToken('invalid_refresh_token');

      expect(result).toBeNull();
    });

    it('should return null for expired refresh token', async () => {
      vi.mocked(nestJwtService.verifyAsync).mockRejectedValueOnce(
        new Error('Refresh token expired')
      );

      const result = await service.refreshAccessToken('expired_refresh_token');

      expect(result).toBeNull();
    });

    it('should extract userId and email from refresh token', async () => {
      const refreshPayload = {
        userId: 'user_456',
        email: 'user456@example.com',
      };

      vi.mocked(nestJwtService.verifyAsync).mockResolvedValueOnce(refreshPayload);
      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('token');

      await service.refreshAccessToken('refresh_token');

      // Check that new token is signed with correct data
      const signCall = vi.mocked(nestJwtService.signAsync).mock.calls[0];
      expect(signCall).toBeDefined();
      if (signCall) {
        expect(signCall[0]).toHaveProperty('userId', 'user_456');
        expect(signCall[0]).toHaveProperty('email', 'user456@example.com');
      }
    });

    it('should include userId and email in new access token', async () => {
      const refreshPayload = {
        userId: 'user_123',
        email: 'test@example.com',
      };

      vi.mocked(nestJwtService.verifyAsync).mockResolvedValueOnce(refreshPayload);
      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('token');

      await service.refreshAccessToken('refresh_token');

      const signCall = vi.mocked(nestJwtService.signAsync).mock.calls[0];
      expect(signCall).toBeDefined();
      if (signCall) {
        const payload = signCall[0] as Record<string, unknown>;
        expect(payload).toHaveProperty('userId', 'user_123');
        expect(payload).toHaveProperty('email', 'test@example.com');
        // Note: iat and exp are added automatically by jsonwebtoken library
      }
    });

    it('should set correct expiry for new access token', async () => {
      const refreshPayload = {
        userId: 'user_123',
        email: 'test@example.com',
      };

      vi.mocked(nestJwtService.verifyAsync).mockResolvedValueOnce(refreshPayload);
      vi.mocked(nestJwtService.signAsync).mockResolvedValueOnce('token');

      await service.refreshAccessToken('refresh_token');

      const signCall = vi.mocked(nestJwtService.signAsync).mock.calls[0];
      expect(signCall).toBeDefined();
      if (signCall) {
        expect(signCall[1]).toHaveProperty('expiresIn', '1h');
      }
    });

    it('should return null for refresh token without userId', async () => {
      const refreshPayload = {
        email: 'test@example.com',
        // userId missing - this will fail isJwtDecodedPayload check
      };

      vi.mocked(nestJwtService.verifyAsync).mockResolvedValueOnce(refreshPayload);

      const result = await service.refreshAccessToken('refresh_token');

      // Should return null because isJwtDecodedPayload requires userId
      expect(result).toBeNull();
    });

    it('should return null on sign error', async () => {
      const refreshPayload = {
        userId: 'user_123',
        email: 'test@example.com',
      };

      vi.mocked(nestJwtService.verifyAsync).mockResolvedValueOnce(refreshPayload);
      vi.mocked(nestJwtService.signAsync).mockRejectedValueOnce(new Error('Sign error'));

      const result = await service.refreshAccessToken('refresh_token');

      expect(result).toBeNull();
    });

    it('should handle concurrent token refresh', async () => {
      const refreshPayload = {
        userId: 'user_123',
        email: 'test@example.com',
      };

      vi.mocked(nestJwtService.verifyAsync).mockResolvedValue(refreshPayload);
      vi.mocked(nestJwtService.signAsync).mockResolvedValue('new_token');

      const promises = [
        service.refreshAccessToken('refresh_1'),
        service.refreshAccessToken('refresh_2'),
        service.refreshAccessToken('refresh_3'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result!.accessToken).toBe('new_token');
      });
    });
  });
});
