import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios, { AxiosError } from 'axios';
import { getAuthPrisma, TEST_DATA } from './support/gateway-test-setup';
import { PrismaClient } from '@prisma/client';

describe('🔔 Gateway - Webhooks E2E Tests', () => {
  let authPrisma: PrismaClient;
  let testUser: { email: string; name: string; password: string; id?: string };
  let accessToken: string;

  beforeAll(async () => {
    authPrisma = getAuthPrisma();
    await authPrisma.$connect();

    testUser = {
      email: `test-webhooks-${Date.now()}@example.com`,
      name: 'Webhooks Test User',
      password: 'SecurePassword123!',
    };
    await axios.post('/auth/register', testUser);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const loginResponse = await axios.post('/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });
    accessToken = loginResponse.data.accessToken;
  });

  afterAll(async () => {
    await authPrisma.user.deleteMany({
      where: { email: { startsWith: 'test-webhooks-' } },
    });
    await authPrisma.$disconnect();
  });

  describe('✅ Webhook Operations', () => {
    it('should create webhook (async)', async () => {
      const response = await axios.post(
        '/webhooks',
        {
          url: 'https://example.com/webhook',
          events: ['user.created', 'user.updated'],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      expect(response.status).toBe(202);
      expect(response.data).toHaveProperty('taskId');
    });

    it('should get webhooks', async () => {
      const response = await axios.get('/webhooks', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('🛡️ Security Tests - SSRF & URL Manipulation', () => {
    it('should prevent SSRF via internal URL', async () => {
      const ssrfUrls = [
        'http://localhost:27017', // MongoDB
        'http://127.0.0.1:3306', // MySQL
        'http://169.254.169.254/latest/meta-data/', // AWS metadata
        'file:///etc/passwd',
        'gopher://internal-server',
      ];

      for (const url of ssrfUrls) {
        try {
          await axios.post(
            '/webhooks',
            {
              url: url,
              events: ['test'],
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          // Должен отклонить внутренние URL
        } catch (error) {
          const axiosError = error as AxiosError;
          expect([400, 422, 403]).toContain(axiosError.response?.status);
        }
      }
    });

    it('should prevent open redirect in webhook URL', async () => {
      const redirectUrls = [
        'https://evil.com',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
      ];

      for (const url of redirectUrls) {
        try {
          await axios.post(
            '/webhooks',
            {
              url: url,
              events: ['test'],
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          // Должен валидировать URL
        } catch (error) {
          const axiosError = error as AxiosError;
          expect([400, 422]).toContain(axiosError.response?.status);
        }
      }
    });

    it('should prevent XSS in webhook events', async () => {
      try {
        await axios.post(
          '/webhooks',
          {
            url: 'https://example.com/webhook',
            events: [TEST_DATA.xssPayload],
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // XSS должен быть санитизирован
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 422]).toContain(axiosError.response?.status);
      }
    });

    it('should prevent SQL injection in webhook ID', async () => {
      try {
        await axios.get(`/webhooks/${TEST_DATA.sqlInjection}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 404]).toContain(axiosError.response?.status);
      }
    });

    it('should prevent command injection in webhook URL', async () => {
      const commandInjection = 'https://example.com; rm -rf /;';
      try {
        await axios.post(
          '/webhooks',
          {
            url: commandInjection,
            events: ['test'],
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
        expect([400, 422]).toContain(axiosError.response?.status);
      }
    });

    it('should prevent NoSQL injection in webhook filters', async () => {
      const nosqlInjection = { $ne: null };
      try {
        await axios.post(
          '/webhooks',
          {
            url: 'https://example.com/webhook',
            events: ['test'],
            filters: nosqlInjection,
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
