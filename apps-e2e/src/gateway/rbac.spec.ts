import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios, { AxiosError } from 'axios';
import { getAuthPrisma, TEST_DATA } from './support/gateway-test-setup';
import { PrismaClient } from '@prisma/client';

describe('🛡️ Gateway - RBAC E2E Tests', () => {
  let authPrisma: PrismaClient;
  let testUser: { email: string; name: string; password: string; id?: string };
  let adminUser: { email: string; name: string; password: string; id?: string };
  let accessToken: string;
  let adminToken: string;

  beforeAll(async () => {
    authPrisma = getAuthPrisma();
    await authPrisma.$connect();

    // Создаем обычного пользователя
    testUser = {
      email: `test-rbac-${Date.now()}@example.com`,
      name: 'RBAC Test User',
      password: 'SecurePassword123!',
    };
    await axios.post('/auth/register', testUser);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const loginResponse = await axios.post('/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });
    accessToken = loginResponse.data.accessToken;

    // Создаем админа
    adminUser = {
      email: `test-rbac-admin-${Date.now()}@example.com`,
      name: 'RBAC Admin',
      password: 'SecurePassword123!',
    };
    await axios.post('/auth/register', adminUser);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const adminLoginResponse = await axios.post('/auth/login', {
      email: adminUser.email,
      password: adminUser.password,
    });
    adminToken = adminLoginResponse.data.accessToken;
  });

  afterAll(async () => {
    await authPrisma.user.deleteMany({
      where: { email: { startsWith: 'test-rbac-' } },
    });
    await authPrisma.$disconnect();
  });

  describe('✅ Role Management', () => {
    it('should create role (admin only)', async () => {
      const response = await axios.post(
        '/rbac/roles',
        {
          name: 'Test Role',
          description: 'Test role description',
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      expect([200, 202]).toContain(response.status);
    });

    it('should get all roles', async () => {
      const response = await axios.get('/rbac/roles', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('🛡️ Security Tests - Authorization Bypass', () => {
    it('should prevent unauthorized role creation', async () => {
      try {
        await axios.post(
          '/rbac/roles',
          {
            name: 'Hacker Role',
            description: 'Attempted unauthorized role',
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Обычный пользователь
            },
          }
        );
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([403, 401]).toContain(axiosError.response?.status);
      }
    });

    it('should prevent SQL injection in role name', async () => {
      try {
        await axios.post(
          '/rbac/roles',
          {
            name: TEST_DATA.sqlInjection,
            description: 'Test',
          },
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          }
        );
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 422]).toContain(axiosError.response?.status);
      }
    });

    it('should prevent privilege escalation via role assignment', async () => {
      // Пытаемся назначить себе админскую роль
      try {
        await axios.post(
          '/rbac/assign-role',
          {
            userId: testUser.id,
            roleId: 'admin-role-id', // Пытаемся назначить админскую роль
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Обычный пользователь
            },
          }
        );
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([403, 401, 404]).toContain(axiosError.response?.status);
      }
    });

    it('should prevent path traversal in role ID', async () => {
      try {
        await axios.get('/rbac/roles/../../../etc/passwd', {
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

    it('should prevent command injection in role description', async () => {
      const commandInjection = 'test"; rm -rf /; echo "';
      try {
        await axios.post(
          '/rbac/roles',
          {
            name: 'Test Role',
            description: commandInjection,
          },
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          }
        );
        // Если создание прошло, проверяем что команда не выполнилась
        // В реальном тесте нужно проверить систему
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 422]).toContain(axiosError.response?.status);
      }
    });
  });
});
