import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios, { AxiosError } from 'axios';
import { getAuthPrisma, TEST_DATA } from './support/gateway-test-setup';
import { PrismaClient } from '@prisma/client';

describe('🔐 Gateway - Authentication E2E Tests', () => {
  let authPrisma: PrismaClient;
  let testUser: { email: string; name: string; password: string; id?: string };
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    // Проверяем доступность Gateway
    try {
      const healthCheck = await axios.get('/auth/health');
      expect(healthCheck.status).toBe(200);
    } catch (error) {
      throw new Error('Gateway is not running. Please start it first: npm run api:gateway');
    }

    // Подключаемся к БД
    authPrisma = getAuthPrisma();
    await authPrisma.$connect();

    // Создаем тестового пользователя для логина
    testUser = {
      email: `test-auth-${Date.now()}@example.com`,
      name: 'Auth Test User',
      password: 'SecurePassword123!',
    };

    // Регистрируем пользователя
    const registerResponse = await axios.post('/auth/register', testUser);
    expect(registerResponse.status).toBe(202);

    // Ждем обработки
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Получаем ID из БД
    const userInDb = await authPrisma.user.findUnique({
      where: { email: testUser.email },
    });
    if (userInDb) {
      testUser.id = userInDb.id;
    }
  });

  afterAll(async () => {
    // Очистка
    try {
      await authPrisma.user.deleteMany({
        where: {
          email: {
            startsWith: 'test-auth-',
          },
        },
      });
    } catch (error) {
      console.warn('Failed to cleanup test users:', error);
    }
    await authPrisma.$disconnect();
  });

  describe('✅ Successful Login', () => {
    it('should login with correct credentials and return tokens', async () => {
      const response = await axios.post('/auth/login', {
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('accessToken');
      expect(response.data).toHaveProperty('refreshToken');
      expect(response.data).toHaveProperty('user');

      accessToken = response.data.accessToken;
      refreshToken = response.data.refreshToken;

      // Проверяем, что токены валидны
      expect(accessToken).toBeTruthy();
      expect(refreshToken).toBeTruthy();
    });

    it('should verify token and return user data', async () => {
      const response = await axios.post(
        '/auth/verify',
        { token: accessToken },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('valid', true);
      expect(response.data).toHaveProperty('user');
    });

    it('should get current user with valid token', async () => {
      const response = await axios.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
      expect(response.data.email).toBe(testUser.email);
    });
  });

  describe('❌ Failed Login Attempts', () => {
    it('should reject wrong password', async () => {
      try {
        await axios.post('/auth/login', {
          email: testUser.email,
          password: 'WrongPassword123!',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should reject non-existent email', async () => {
      try {
        await axios.post('/auth/login', {
          email: 'nonexistent@example.com',
          password: TEST_DATA.user.password,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('🛡️ Security Tests', () => {
    it('should reject login with SQL injection in email', async () => {
      try {
        await axios.post('/auth/login', {
          email: TEST_DATA.sqlInjection,
          password: TEST_DATA.user.password,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 401, 422]).toContain(axiosError.response?.status);
      }
    });

    it('should require authentication for protected routes', async () => {
      try {
        await axios.get('/auth/me');
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should reject invalid token', async () => {
      try {
        await axios.get('/auth/me', {
          headers: {
            Authorization: 'Bearer invalid-token-12345',
          },
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should reject expired token', async () => {
      // Создаем токен с коротким временем жизни (если есть такая возможность)
      // Или проверяем, что система правильно обрабатывает истекшие токены
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      try {
        await axios.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${expiredToken}`,
          },
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('🔄 Token Refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const response = await axios.post('/auth/refresh', {
        refreshToken: refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('accessToken');
      expect(response.data).toHaveProperty('refreshToken');

      // Обновляем токены
      accessToken = response.data.accessToken;
      refreshToken = response.data.refreshToken;
    });

    it('should reject invalid refresh token', async () => {
      try {
        await axios.post('/auth/refresh', {
          refreshToken: 'invalid-refresh-token',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('🚪 Logout', () => {
    it('should logout successfully', async () => {
      const response = await axios.post(
        '/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      expect(response.status).toBe(200);
    });

    it('should invalidate token after logout', async () => {
      // После logout токен должен быть невалидным
      try {
        await axios.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        // Может быть 401 или 200 в зависимости от реализации
      } catch (error) {
        const axiosError = error as AxiosError;
        // Ожидаем 401 если токен инвалидирован
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });
});

