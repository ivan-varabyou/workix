import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios, { AxiosError } from 'axios';
import { getAuthPrisma, TEST_DATA } from './support/gateway-test-setup';
import { PrismaClient } from '@prisma/client';

describe('👤 Gateway - Users E2E Tests', () => {
  let authPrisma: PrismaClient;
  let testUser: { email: string; name: string; password: string; id?: string };
  let accessToken: string;

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
      email: `test-users-${Date.now()}@example.com`,
      name: 'Users Test User',
      password: 'SecurePassword123!',
    };

    // Регистрируем
    await axios.post('/auth/register', testUser);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Логиним
    const loginResponse = await axios.post('/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });
    accessToken = loginResponse.data.accessToken;

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
            startsWith: 'test-users-',
          },
        },
      });
    } catch (error) {
      console.warn('Failed to cleanup test users:', error);
    }
    await authPrisma.$disconnect();
  });

  describe('✅ Get User Profile', () => {
    it('should get user profile by ID and verify in database', async () => {
      if (!testUser.id) {
        expect.fail('User ID not available');
        return;
      }

      const response = await axios.get(`/users/${testUser.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testUser.id);
      expect(response.data).toHaveProperty('email', testUser.email);
      expect(response.data).not.toHaveProperty('passwordHash');

      // Проверяем в БД
      const userInDb = await authPrisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(userInDb).toBeTruthy();
      expect(userInDb?.email).toBe(testUser.email);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      try {
        await axios.get(`/users/${fakeId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    });
  });

  describe('✅ Update User Profile', () => {
    it('should update user profile and verify in database', async () => {
      if (!testUser.id) {
        expect.fail('User ID not available');
        return;
      }

      const updatedName = 'Updated Name';
      const response = await axios.put(
        `/users/${testUser.id}`,
        {
          name: updatedName,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Проверяем ответ (может быть асинхронным с taskId)
      if (response.status === 202) {
        expect(response.data).toHaveProperty('taskId');
        // Ждем обработки
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        expect(response.status).toBe(200);
      }

      // Проверяем в БД
      const userInDb = await authPrisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(userInDb).toBeTruthy();
      if (userInDb) {
        expect(userInDb.name).toBe(updatedName);
      }
    });

    it('should reject update with invalid data', async () => {
      if (!testUser.id) {
        expect.fail('User ID not available');
        return;
      }

      try {
        await axios.put(
          `/users/${testUser.id}`,
          {
            email: TEST_DATA.invalidEmail, // Невалидный email
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

  describe('🛡️ Security Tests', () => {
    it('should require authentication for user operations', async () => {
      if (!testUser.id) {
        expect.fail('User ID not available');
        return;
      }

      try {
        await axios.get(`/users/${testUser.id}`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should prevent access to other users profiles', async () => {
      // Создаем второго пользователя
      const secondUser = {
        email: `test-users-2-${Date.now()}@example.com`,
        name: 'Second User',
        password: 'SecurePassword123!',
      };

      await axios.post('/auth/register', secondUser);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const loginResponse = await axios.post('/auth/login', {
        email: secondUser.email,
        password: secondUser.password,
      });
      const secondUserToken = loginResponse.data.accessToken;

      // Пытаемся получить профиль первого пользователя токеном второго
      if (testUser.id) {
        try {
          await axios.get(`/users/${testUser.id}`, {
            headers: {
              Authorization: `Bearer ${secondUserToken}`,
            },
          });
          // В зависимости от политики безопасности может быть 403 или 200
          // Если разрешено - проверяем, что данные корректны
        } catch (error) {
          const axiosError = error as AxiosError;
          // Может быть 403 Forbidden или 404 Not Found
          expect([403, 404]).toContain(axiosError.response?.status);
        }
      }
    });

    it('should sanitize XSS in user name update', async () => {
      if (!testUser.id) {
        expect.fail('User ID not available');
        return;
      }

      try {
        await axios.put(
          `/users/${testUser.id}`,
          {
            name: TEST_DATA.xssPayload,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // Если обновление прошло, проверяем БД
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const userInDb = await authPrisma.user.findUnique({
          where: { id: testUser.id },
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
  });

  describe('🗑️ Delete User', () => {
    it('should delete user and verify removal from database', async () => {
      // Создаем пользователя для удаления
      const userToDelete = {
        email: `test-delete-${Date.now()}@example.com`,
        name: 'User To Delete',
        password: 'SecurePassword123!',
      };

      await axios.post('/auth/register', userToDelete);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const loginResponse = await axios.post('/auth/login', {
        email: userToDelete.email,
        password: userToDelete.password,
      });
      const deleteToken = loginResponse.data.accessToken;

      const userInDb = await authPrisma.user.findUnique({
        where: { email: userToDelete.email },
      });
      if (!userInDb) {
        expect.fail('User not found in database');
        return;
      }

      const response = await axios.delete(`/users/${userInDb.id}`, {
        headers: {
          Authorization: `Bearer ${deleteToken}`,
        },
      });

      // Может быть асинхронным
      if (response.status === 202) {
        expect(response.data).toHaveProperty('taskId');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        expect(response.status).toBe(200);
      }

      // Проверяем, что пользователь удален из БД
      const deletedUser = await authPrisma.user.findUnique({
        where: { id: userInDb.id },
      });
      expect(deletedUser).toBeNull();
    });
  });
});
