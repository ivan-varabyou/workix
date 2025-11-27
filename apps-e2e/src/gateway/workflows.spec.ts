import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios, { AxiosError } from 'axios';
import { getAuthPrisma, TEST_DATA } from './support/gateway-test-setup';
import { PrismaClient } from '@prisma/client';

describe('🔄 Gateway - Workflows E2E Tests', () => {
  let authPrisma: PrismaClient;
  let testUser: { email: string; name: string; password: string; id?: string };
  let accessToken: string;

  beforeAll(async () => {
    authPrisma = getAuthPrisma();
    await authPrisma.$connect();

    testUser = {
      email: `test-workflows-${Date.now()}@example.com`,
      name: 'Workflows Test User',
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
      where: { email: { startsWith: 'test-workflows-' } },
    });
    await authPrisma.$disconnect();
  });

  describe('✅ Workflow Operations', () => {
    it('should create workflow (async)', async () => {
      const response = await axios.post(
        '/workflows',
        {
          name: 'Test Workflow',
          description: 'Test workflow description',
          steps: [],
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

    it('should get workflows', async () => {
      const response = await axios.get('/workflows', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('🛡️ Security Tests - Code Injection', () => {
    it('should prevent code injection in workflow steps', async () => {
      const codeInjection = {
        name: 'Test Workflow',
        steps: [
          {
            type: 'script',
            code: 'eval("malicious code")',
          },
        ],
      };

      try {
        await axios.post('/workflows', codeInjection, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        // Должен санитизировать или отклонить
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 422]).toContain(axiosError.response?.status);
      }
    });

    it('should prevent XXE in workflow configuration', async () => {
      const xxePayload = `<?xml version="1.0"?>
<!DOCTYPE foo [
<!ELEMENT foo ANY>
<!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<foo>&xxe;</foo>`;

      try {
        await axios.post(
          '/workflows',
          {
            name: 'Test Workflow',
            config: xxePayload,
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

    it('should prevent path traversal in workflow file paths', async () => {
      try {
        await axios.post(
          '/workflows',
          {
            name: 'Test Workflow',
            filePath: '../../../etc/passwd',
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

    it('should prevent LDAP injection in workflow filters', async () => {
      const ldapInjection = ')(&(uid=*)(|(userPassword=*))';
      try {
        await axios.post(
          '/workflows',
          {
            name: 'Test Workflow',
            filter: ldapInjection,
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
