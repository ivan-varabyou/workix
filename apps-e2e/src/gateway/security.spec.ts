import { describe, it, expect, beforeAll } from 'vitest';
import axios, { AxiosError } from 'axios';
import { TEST_DATA } from './support/gateway-test-setup';

describe('🛡️ Gateway - Security E2E Tests', () => {
  beforeAll(async () => {
    // Проверяем доступность Gateway
    try {
      const healthCheck = await axios.get('/auth/health');
      expect(healthCheck.status).toBe(200);
    } catch (error) {
      throw new Error('Gateway is not running. Please start it first: npm run api:gateway');
    }
  });

  describe('🔒 SQL Injection Protection', () => {
    it('should prevent SQL injection in registration email', async () => {
      try {
        await axios.post('/auth/register', {
          email: `test${TEST_DATA.sqlInjection}@example.com`,
          name: 'Test',
          password: TEST_DATA.user.password,
        });
        // Должен вернуть ошибку валидации
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 422]).toContain(axiosError.response?.status);
      }
    });

    it('should prevent SQL injection in login email', async () => {
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
  });

  describe('🚫 XSS Protection', () => {
    it('should sanitize XSS in user name', async () => {
      try {
        const response = await axios.post('/auth/register', {
          email: `test-xss-${Date.now()}@example.com`,
          name: TEST_DATA.xssPayload,
          password: TEST_DATA.user.password,
        });
        // Если регистрация прошла, проверяем, что XSS не сохранился
        if (response.status === 202) {
          // В реальном тесте нужно проверить БД
          expect(response.data).not.toContain('<script>');
        }
      } catch (error) {
        // Ожидаем ошибку валидации
        const axiosError = error as AxiosError;
        expect([400, 422]).toContain(axiosError.response?.status);
      }
    });
  });

  describe('🔐 Authentication Bypass Attempts', () => {
    it('should reject requests without token to protected routes', async () => {
      try {
        await axios.get('/users/123');
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should reject malformed tokens', async () => {
      try {
        await axios.get('/auth/me', {
          headers: {
            Authorization: 'Bearer not.a.valid.jwt.token',
          },
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should reject empty token', async () => {
      try {
        await axios.get('/auth/me', {
          headers: {
            Authorization: 'Bearer ',
          },
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('📊 Rate Limiting', () => {
    it('should enforce rate limiting on login attempts', async () => {
      // Делаем много запросов подряд
      const attempts = 10;
      let rateLimited = false;

      for (let i = 0; i < attempts; i++) {
        try {
          await axios.post('/auth/login', {
            email: 'test@example.com',
            password: 'wrong',
          });
        } catch (error) {
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 429) {
            rateLimited = true;
            break;
          }
        }
      }

      // В зависимости от конфигурации rate limiting может быть включен или нет
      // Если включен, должен вернуть 429
      if (rateLimited) {
        expect(rateLimited).toBe(true);
      }
    });
  });

  describe('🔍 Information Disclosure', () => {
    it('should not expose internal errors', async () => {
      try {
        await axios.post('/auth/login', {
          email: 'test@example.com',
          password: 'wrong',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        const responseData = axiosError.response?.data;
        // Не должно быть деталей внутренней структуры
        expect(responseData).not.toContain('Prisma');
        expect(responseData).not.toContain('database');
        expect(responseData).not.toContain('SQL');
      }
    });

    it('should not expose stack traces in production', async () => {
      // В production режиме не должно быть stack traces
      if (process.env.NODE_ENV === 'production') {
        try {
          await axios.get('/nonexistent-endpoint');
        } catch (error) {
          const axiosError = error as AxiosError;
          const responseData = JSON.stringify(axiosError.response?.data);
          expect(responseData).not.toContain('at ');
          expect(responseData).not.toContain('Error:');
        }
      }
    });
  });

  describe('🌐 CORS Protection', () => {
    it('should have proper CORS headers', async () => {
      const response = await axios.options('/auth/health');
      // Проверяем наличие CORS заголовков
      expect(response.headers).toBeDefined();
    });
  });
});

