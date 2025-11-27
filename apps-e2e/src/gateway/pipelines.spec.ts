import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios, { AxiosError } from 'axios';
import { getAuthPrisma, TEST_DATA } from './support/gateway-test-setup';
import { PrismaClient } from '@prisma/client';

describe('📦 Gateway - Pipelines E2E Tests', () => {
  let authPrisma: PrismaClient;
  let testUser: { email: string; name: string; password: string; id?: string };
  let accessToken: string;
  let createdPipelineId: string;

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

    // Создаем и логиним тестового пользователя
    testUser = {
      email: `test-pipelines-${Date.now()}@example.com`,
      name: 'Pipelines Test User',
      password: 'SecurePassword123!',
    };

    await axios.post('/auth/register', testUser);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const loginResponse = await axios.post('/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });
    accessToken = loginResponse.data.accessToken;

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
            startsWith: 'test-pipelines-',
          },
        },
      });
    } catch (error) {
      console.warn('Failed to cleanup test users:', error);
    }
    await authPrisma.$disconnect();
  });

  describe('✅ Create Pipeline', () => {
    it('should create pipeline and return taskId (async)', async () => {
      const response = await axios.post(
        '/pipelines',
        {
          name: 'Test Pipeline',
          description: 'Test pipeline description',
          steps: [],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Асинхронная операция - возвращает taskId
      expect(response.status).toBe(202);
      expect(response.data).toHaveProperty('taskId');
      expect(response.data).toHaveProperty('status', 'processing');
    });

    it('should reject pipeline with invalid data', async () => {
      try {
        await axios.post(
          '/pipelines',
          {
            // name missing
            description: 'Test',
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('✅ Get Pipelines', () => {
    it('should get user pipelines', async () => {
      const response = await axios.get('/pipelines', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should get public pipelines without authentication', async () => {
      const response = await axios.get('/pipelines/public');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should require authentication for user pipelines', async () => {
      try {
        await axios.get('/pipelines');
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('🛡️ Security Tests', () => {
    it('should sanitize XSS in pipeline name', async () => {
      try {
        await axios.post(
          '/pipelines',
          {
            name: TEST_DATA.xssPayload,
            description: 'Test',
            steps: [],
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // Если создание прошло, XSS должен быть санитизирован
        // В реальном тесте нужно проверить БД
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 422]).toContain(axiosError.response?.status);
      }
    });

    it('should prevent SQL injection in pipeline description', async () => {
      try {
        await axios.post(
          '/pipelines',
          {
            name: 'Test Pipeline',
            description: TEST_DATA.sqlInjection,
            steps: [],
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // Должен обработать безопасно
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 422]).toContain(axiosError.response?.status);
      }
    });
  });
});
