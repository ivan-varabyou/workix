import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios, { AxiosError } from 'axios';
import { getAuthPrisma, TEST_DATA } from './support/gateway-test-setup';
import { PrismaClient } from '@prisma/client';

describe('🔐 Gateway - Registration E2E Tests', () => {
  let authPrisma: PrismaClient;
  const testUser = {
    email: `test-reg-${Date.now()}@example.com`,
    name: 'Registration Test User',
    password: 'SecurePassword123!',
  };

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
  });

  afterAll(async () => {
    // Очистка: удаляем тестового пользователя из БД
    try {
      await authPrisma.user.deleteMany({
        where: {
          email: {
            startsWith: 'test-reg-',
          },
        },
      });
    } catch (error) {
      console.warn('Failed to cleanup test users:', error);
    }
    await authPrisma.$disconnect();
  });

  describe('✅ Successful Registration', () => {
    it('should register user and create record in database', async () => {
      const response = await axios.post('/auth/register', {
        email: testUser.email,
        name: testUser.name,
        password: testUser.password,
      });

      // Проверяем ответ Gateway (асинхронный, возвращает taskId)
      expect(response.status).toBe(202);
      expect(response.data).toHaveProperty('taskId');
      expect(response.data).toHaveProperty('status', 'processing');

      // Ждем обработки асинхронной задачи (максимум 10 секунд)
      const maxWaitTime = 10000;
      const checkInterval = 500;
      let userInDb = null;
      let waited = 0;

      while (!userInDb && waited < maxWaitTime) {
        await new Promise((resolve) => setTimeout(resolve, checkInterval));
        waited += checkInterval;
        userInDb = await authPrisma.user.findUnique({
          where: { email: testUser.email },
        });
      }

      // Проверяем, что пользователь создан в БД
      expect(userInDb).toBeTruthy();
      expect(userInDb?.email).toBe(testUser.email);
      expect(userInDb?.name).toBe(testUser.name);
      expect(userInDb?.passwordHash).toBeTruthy();
      expect(userInDb?.passwordHash).not.toBe(testUser.password); // Пароль должен быть захеширован
      expect(userInDb?.passwordHash.length).toBeGreaterThan(20); // Хеш должен быть достаточно длинным
    });
  });

  describe('❌ Validation Errors', () => {
    it('should reject invalid email format', async () => {
      try {
        await axios.post('/auth/register', {
          email: TEST_DATA.invalidEmail,
          name: 'Test',
          password: TEST_DATA.user.password,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should reject weak password', async () => {
      try {
        await axios.post('/auth/register', {
          email: `test-weak-${Date.now()}@example.com`,
          name: 'Test',
          password: TEST_DATA.weakPassword,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should reject missing required fields', async () => {
      try {
        await axios.post('/auth/register', {
          email: testUser.email,
          // name missing
          password: testUser.password,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should reject duplicate email registration', async () => {
      // Сначала регистрируем пользователя
      const firstResponse = await axios.post('/auth/register', {
        email: `test-duplicate-${Date.now()}@example.com`,
        name: 'First User',
        password: TEST_DATA.user.password,
      });
      expect(firstResponse.status).toBe(202);

      // Ждем обработки
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Пытаемся зарегистрировать с тем же email
      try {
        const duplicateEmail = `test-duplicate-${Date.now()}@example.com`;
        // Сначала создаем первого
        await axios.post('/auth/register', {
          email: duplicateEmail,
          name: 'First',
          password: TEST_DATA.user.password,
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Потом пытаемся создать второго с тем же email
        await axios.post('/auth/register', {
          email: duplicateEmail,
          name: 'Second',
          password: TEST_DATA.user.password,
        });
        expect.fail('Should have thrown an error for duplicate email');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 409]).toContain(axiosError.response?.status); // 409 Conflict или 400 Bad Request
      }
    });

    it('should reject empty email', async () => {
      try {
        await axios.post('/auth/register', {
          email: '',
          name: 'Test',
          password: TEST_DATA.user.password,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should reject very long email', async () => {
      const longEmail = 'a'.repeat(300) + '@example.com';
      try {
        await axios.post('/auth/register', {
          email: longEmail,
          name: 'Test',
          password: TEST_DATA.user.password,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('🛡️ Security Tests', () => {
    it('should sanitize SQL injection attempts in email', async () => {
      try {
        await axios.post('/auth/register', {
          email: TEST_DATA.sqlInjection,
          name: 'Test',
          password: TEST_DATA.user.password,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 422]).toContain(axiosError.response?.status);
      }
    });

    it('should sanitize XSS payloads in name field', async () => {
      try {
        await axios.post('/auth/register', {
          email: `test-xss-${Date.now()}@example.com`,
          name: TEST_DATA.xssPayload,
          password: TEST_DATA.user.password,
        });
        // Проверяем, что XSS не сохранился в БД
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const userInDb = await authPrisma.user.findFirst({
          where: { email: { contains: 'test-xss-' } },
        });
        if (userInDb) {
          expect(userInDb.name).not.toContain('<script>');
        }
      } catch (error) {
        // Ожидаем ошибку валидации
        const axiosError = error as AxiosError;
        expect([400, 422]).toContain(axiosError.response?.status);
      }
    });

    it('should not expose password in response', async () => {
      const response = await axios.post('/auth/register', {
        email: `test-sec-${Date.now()}@example.com`,
        name: 'Security Test',
        password: TEST_DATA.user.password,
      });

      expect(response.data).not.toHaveProperty('password');
      expect(response.data).not.toHaveProperty('passwordHash');
    });
  });
});
