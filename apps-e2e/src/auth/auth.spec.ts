import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios, { AxiosError } from 'axios';

// Настройка базового URL для auth сервиса
// Если axios.defaults.baseURL установлен в setup файле, используем его
const API_BASE = axios.defaults.baseURL
  ? `${axios.defaults.baseURL}/api`
  : `${process.env.AUTH_SERVICE_URL || 'http://localhost:7200'}/api`;

// Тестовые данные
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  name: 'Test User',
  password: 'TestPassword123!@#',
};

const INVALID_EMAIL = 'invalid-email';
const WEAK_PASSWORD = 'weak';
const NON_EXISTENT_EMAIL = 'nonexistent@example.com';
const WRONG_PASSWORD = 'WrongPassword123!@#';

describe('Auth Service E2E Tests', () => {
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  beforeAll(async () => {
    // Проверяем доступность сервиса
    try {
      const healthCheck = await axios.get(`${API_BASE}/auth/health`);
      expect(healthCheck.status).toBe(200);
    } catch (error) {
      throw new Error('Auth service is not running. Please start it first: npm run api:auth');
    }
  });

  afterAll(async () => {
    // Очистка: можно удалить тестового пользователя если нужно
    // В реальном проекте это делается через отдельный endpoint или тестовую БД
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await axios.get(`${API_BASE}/auth/health`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(response.data.status).toBe('ok');
    });
  });

  describe('Registration', () => {
    it('should register a new user successfully', async () => {
      const response = await axios.post(`${API_BASE}/auth/register`, {
        email: TEST_USER.email,
        name: TEST_USER.name,
        password: TEST_USER.password,
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('message');
      expect(response.data).toHaveProperty('user');
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user.email).toBe(TEST_USER.email);
      expect(response.data.user.name).toBe(TEST_USER.name);
      expect(response.data.user).not.toHaveProperty('passwordHash'); // Пароль не должен быть в ответе

      userId = response.data.user.id;
    });

    it('should fail to register with invalid email', async () => {
      try {
        await axios.post(`${API_BASE}/auth/register`, {
          email: INVALID_EMAIL,
          name: 'Test User',
          password: TEST_USER.password,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should fail to register with weak password', async () => {
      try {
        await axios.post(`${API_BASE}/auth/register`, {
          email: `test-weak-${Date.now()}@example.com`,
          name: 'Test User',
          password: WEAK_PASSWORD,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should fail to register duplicate email', async () => {
      try {
        await axios.post(`${API_BASE}/auth/register`, {
          email: TEST_USER.email, // Используем уже зарегистрированный email
          name: 'Another User',
          password: TEST_USER.password,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(409); // Conflict
      }
    });

    it('should fail to register with missing fields', async () => {
      try {
        await axios.post(`${API_BASE}/auth/register`, {
          email: TEST_USER.email,
          // name и password отсутствуют
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('Login', () => {
    it('should login with correct credentials', async () => {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('accessToken');
      expect(response.data).toHaveProperty('refreshToken');
      expect(response.data).toHaveProperty('user');
      expect(response.data.user.email).toBe(TEST_USER.email);

      accessToken = response.data.accessToken;
      refreshToken = response.data.refreshToken;

      // Проверяем, что токен валидный (не пустой и имеет структуру JWT)
      expect(accessToken).toBeTruthy();
      expect(accessToken.split('.').length).toBe(3); // JWT имеет 3 части
    });

    it('should fail to login with wrong password', async () => {
      try {
        await axios.post(`${API_BASE}/auth/login`, {
          email: TEST_USER.email,
          password: WRONG_PASSWORD,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should fail to login with non-existent email', async () => {
      try {
        await axios.post(`${API_BASE}/auth/login`, {
          email: NON_EXISTENT_EMAIL,
          password: TEST_USER.password,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should fail to login with missing credentials', async () => {
      try {
        await axios.post(`${API_BASE}/auth/login`, {
          email: TEST_USER.email,
          // password отсутствует
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('Token Verification', () => {
    it('should verify valid access token', async () => {
      const response = await axios.post(`${API_BASE}/auth/verify`, {
        token: accessToken,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('valid');
      expect(response.data.valid).toBe(true);
      expect(response.data).toHaveProperty('payload');
      expect(response.data.payload).toHaveProperty('userId');
      expect(response.data.payload.userId).toBe(userId);
    });

    it('should fail to verify invalid token', async () => {
      try {
        await axios.post(`${API_BASE}/auth/verify`, {
          token: 'invalid.token.here',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should fail to verify empty token', async () => {
      try {
        await axios.post(`${API_BASE}/auth/verify`, {
          token: '',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('Get Current User', () => {
    it('should get current user with valid token', async () => {
      const response = await axios.get(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
      expect(response.data.id).toBe(userId);
      expect(response.data.email).toBe(TEST_USER.email);
      expect(response.data.name).toBe(TEST_USER.name);
    });

    it('should fail to get current user without token', async () => {
      try {
        await axios.get(`${API_BASE}/auth/me`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should fail to get current user with invalid token', async () => {
      try {
        await axios.get(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: 'Bearer invalid.token.here',
          },
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('Token Refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const response = await axios.post(`${API_BASE}/auth/refresh`, {
        refreshToken: refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('accessToken');
      expect(response.data).toHaveProperty('refreshToken');

      // Обновляем токены для дальнейших тестов
      accessToken = response.data.accessToken;
      refreshToken = response.data.refreshToken;
    });

    it('should fail to refresh with invalid refresh token', async () => {
      try {
        await axios.post(`${API_BASE}/auth/refresh`, {
          refreshToken: 'invalid.refresh.token',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should fail to refresh with missing refresh token', async () => {
      try {
        await axios.post(`${API_BASE}/auth/refresh`, {});
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('Password Reset Flow', () => {
    it('should request password reset for existing user', async () => {
      const response = await axios.post(`${API_BASE}/auth/password-reset/request`, {
        email: TEST_USER.email,
      });

      expect(response.status).toBe(200);
      // Обычно не возвращаем детали для безопасности, но подтверждаем что запрос принят
      expect(response.data).toHaveProperty('message');
    });

    it('should handle password reset request for non-existent user gracefully', async () => {
      // Для безопасности не раскрываем, существует ли пользователь
      const response = await axios.post(`${API_BASE}/auth/password-reset/request`, {
        email: NON_EXISTENT_EMAIL,
      });

      // Может быть 200 (не раскрываем существование) или 404
      expect([200, 404]).toContain(response.status);
    });

    it('should fail to request password reset without email', async () => {
      try {
        await axios.post(`${API_BASE}/auth/password-reset/request`, {});
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('Error Handling', () => {
    it('should return proper error format for validation errors', async () => {
      try {
        await axios.post(`${API_BASE}/auth/register`, {
          email: 'invalid',
          name: '',
          password: 'weak',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
        expect(axiosError.response?.data).toHaveProperty('message');
        // Может быть массив ошибок валидации
      }
    });

    it('should return proper error format for unauthorized access', async () => {
      try {
        await axios.get(`${API_BASE}/auth/me`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
        expect(axiosError.response?.data).toHaveProperty('message');
      }
    });
  });
});
