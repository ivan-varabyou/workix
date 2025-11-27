import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

/**
 * E2E Tests for API Auth Service - All Endpoints
 *
 * Tests all endpoints with real data and database
 *
 * Prerequisites:
 * - PostgreSQL database running on port 5102 (workix_auth)
 * - Redis running on port 5900
 * - API Auth service running on port 7102
 *
 * Run: npm run test:auth:e2e:all
 */

const BASE_URL = process.env.API_AUTH_URL || 'http://localhost:7102/api-auth/v1';
const TEST_TIMEOUT = 60000; // 60 seconds for E2E tests

// Test data
let testUser: {
  email: string;
  name: string;
  password: string;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
};

let testUser2: {
  email: string;
  name: string;
  password: string;
  userId?: string;
  accessToken?: string;
};

describe('API Auth Service - E2E Tests', () => {
  beforeAll(() => {
    // Generate unique test data
    const timestamp = Date.now();
    testUser = {
      email: `test-${timestamp}@example.com`,
      name: 'Test User',
      password: 'TestPassword123!',
    };
    testUser2 = {
      email: `test2-${timestamp}@example.com`,
      name: 'Test User 2',
      password: 'TestPassword123!',
    };
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await fetch(`${BASE_URL}/auth/health`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('ok');
      expect(data).toHaveProperty('timestamp');
    }, TEST_TIMEOUT);
  });

  describe('Authentication Endpoints', () => {
    it('POST /auth/register - should register new user', async () => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          name: testUser.name,
          password: testUser.password,
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('user');
      expect(data.user).toHaveProperty('id');
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.name).toBe(testUser.name);
      expect(data.user).not.toHaveProperty('password');
      testUser.userId = data.user.id;
    }, TEST_TIMEOUT);

    it('POST /auth/register - should reject duplicate email', async () => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          name: 'Another User',
          password: 'AnotherPassword123!',
        }),
      });

      // Should return 400 or 409
      expect([400, 409]).toContain(response.status);
    }, TEST_TIMEOUT);

    it('POST /auth/login - should login with valid credentials', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('tokens');
      expect(data.tokens).toHaveProperty('accessToken');
      expect(data.tokens).toHaveProperty('refreshToken');
      expect(data.tokens).toHaveProperty('expiresIn');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe(testUser.email);

      testUser.accessToken = data.tokens.accessToken;
      testUser.refreshToken = data.tokens.refreshToken;
    }, TEST_TIMEOUT);

    it('POST /auth/login - should reject invalid credentials', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'WrongPassword123!',
        }),
      });

      expect(response.status).toBe(401);
    }, TEST_TIMEOUT);

    it('POST /auth/verify - should verify valid token', async () => {
      if (!testUser.accessToken) {
        throw new Error('Access token not available');
      }

      const response = await fetch(`${BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: testUser.accessToken,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('valid');
      expect(data.valid).toBe(true);
      expect(data).toHaveProperty('userId');
      expect(data.userId).toBe(testUser.userId);
    }, TEST_TIMEOUT);

    it('POST /auth/verify - should reject invalid token', async () => {
      const response = await fetch(`${BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'invalid-token',
        }),
      });

      expect(response.status).toBe(400);
    }, TEST_TIMEOUT);

    it('POST /auth/refresh - should refresh access token', async () => {
      if (!testUser.refreshToken) {
        throw new Error('Refresh token not available');
      }

      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: testUser.refreshToken,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('refreshToken');
      expect(data).toHaveProperty('expiresIn');

      // Update tokens
      testUser.accessToken = data.accessToken;
      testUser.refreshToken = data.refreshToken;
    }, TEST_TIMEOUT);

    it('GET /auth/me - should get current user', async () => {
      if (!testUser.accessToken) {
        throw new Error('Access token not available');
      }

      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testUser.accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('name');
      expect(data.email).toBe(testUser.email);
      expect(data.name).toBe(testUser.name);
    }, TEST_TIMEOUT);

    it('GET /auth/me - should reject request without token', async () => {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
      });

      expect(response.status).toBe(401);
    }, TEST_TIMEOUT);

    it('POST /auth/logout - should logout user', async () => {
      if (!testUser.accessToken || !testUser.refreshToken) {
        throw new Error('Tokens not available');
      }

      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testUser.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: testUser.refreshToken,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('message');
    }, TEST_TIMEOUT);
  });

  describe('Password Reset Endpoints', () => {
    beforeEach(async () => {
      // Register second user for password reset tests
      if (!testUser2.userId) {
        const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testUser2.email,
            name: testUser2.name,
            password: testUser2.password,
          }),
        });
        if (registerResponse.ok) {
          const data = await registerResponse.json();
          testUser2.userId = data.user.id;
        }
      }
    });

    it('POST /auth/password-reset/request - should request password reset', async () => {
      const response = await fetch(`${BASE_URL}/auth/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser2.email,
        }),
      });

      // Should return 200 even if email doesn't exist (security)
      expect(response.status).toBe(200);
    }, TEST_TIMEOUT);

    it('POST /auth/password-reset/verify - should verify reset token', async () => {
      // Note: This requires a valid token from email, which we can't get in E2E
      // This test would need to be adjusted based on actual implementation
      const response = await fetch(`${BASE_URL}/auth/password-reset/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'invalid-token',
        }),
      });

      expect([400, 401]).toContain(response.status);
    }, TEST_TIMEOUT);
  });

  describe('Email Verification Endpoints', () => {
    it('POST /auth/email-verification/send - should send verification email', async () => {
      if (!testUser.accessToken) {
        // Re-login if needed
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password,
          }),
        });
        if (loginResponse.ok) {
          const data = await loginResponse.json();
          testUser.accessToken = data.tokens.accessToken;
        }
      }

      if (!testUser.accessToken) {
        throw new Error('Access token not available');
      }

      const response = await fetch(`${BASE_URL}/auth/email-verification/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testUser.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
        }),
      });

      expect([200, 201]).toContain(response.status);
    }, TEST_TIMEOUT);

    it('GET /auth/email-verification/status - should get verification status', async () => {
      if (!testUser.accessToken) {
        throw new Error('Access token not available');
      }

      const response = await fetch(`${BASE_URL}/auth/email-verification/status?email=${testUser.email}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testUser.accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('verified');
    }, TEST_TIMEOUT);
  });

  describe('User Management Endpoints', () => {
    beforeEach(async () => {
      // Ensure we have a valid token
      if (!testUser.accessToken) {
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password,
          }),
        });
        if (loginResponse.ok) {
          const data = await loginResponse.json();
          testUser.accessToken = data.tokens.accessToken;
        }
      }
    });

    it('GET /users/me - should get current user profile', async () => {
      if (!testUser.accessToken) {
        throw new Error('Access token not available');
      }

      const response = await fetch(`${BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testUser.accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email');
      expect(data.email).toBe(testUser.email);
    }, TEST_TIMEOUT);

    it('GET /users/:userId - should get user by ID', async () => {
      if (!testUser.accessToken || !testUser.userId) {
        throw new Error('Token or user ID not available');
      }

      const response = await fetch(`${BASE_URL}/users/${testUser.userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testUser.accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.id).toBe(testUser.userId);
    }, TEST_TIMEOUT);

    it('GET /users - should list users with pagination', async () => {
      if (!testUser.accessToken) {
        throw new Error('Access token not available');
      }

      const response = await fetch(`${BASE_URL}/users?limit=10&offset=0`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testUser.accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('users');
      expect(Array.isArray(data.users)).toBe(true);
    }, TEST_TIMEOUT);

    it('GET /users/search - should search users', async () => {
      if (!testUser.accessToken) {
        throw new Error('Access token not available');
      }

      const response = await fetch(`${BASE_URL}/users/search?q=test&limit=10`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testUser.accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    }, TEST_TIMEOUT);

    it('PUT /users/:userId - should update user profile', async () => {
      if (!testUser.accessToken || !testUser.userId) {
        throw new Error('Token or user ID not available');
      }

      const response = await fetch(`${BASE_URL}/users/${testUser.userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${testUser.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated Test User',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('name');
      expect(data.name).toBe('Updated Test User');
    }, TEST_TIMEOUT);
  });

  describe('2FA Endpoints', () => {
    beforeEach(async () => {
      // Ensure we have a valid token
      if (!testUser.accessToken) {
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password,
          }),
        });
        if (loginResponse.ok) {
          const data = await loginResponse.json();
          testUser.accessToken = data.tokens.accessToken;
        }
      }
    });

    it('GET /auth/2fa/status - should get 2FA status', async () => {
      if (!testUser.accessToken) {
        throw new Error('Access token not available');
      }

      const response = await fetch(`${BASE_URL}/auth/2fa/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testUser.accessToken}`,
        },
      });

      // May return 200 or 403 if 2FA is disabled
      expect([200, 403]).toContain(response.status);
    }, TEST_TIMEOUT);
  });

  describe('RBAC Endpoints', () => {
    beforeEach(async () => {
      // Ensure we have a valid token
      if (!testUser.accessToken) {
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password,
          }),
        });
        if (loginResponse.ok) {
          const data = await loginResponse.json();
          testUser.accessToken = data.tokens.accessToken;
        }
      }
    });

    it('GET /rbac/roles - should get all roles', async () => {
      if (!testUser.accessToken) {
        throw new Error('Access token not available');
      }

      const response = await fetch(`${BASE_URL}/rbac/roles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testUser.accessToken}`,
        },
      });

      // May require admin role
      expect([200, 401, 403]).toContain(response.status);
    }, TEST_TIMEOUT);

    it('GET /rbac/permissions - should get all permissions', async () => {
      if (!testUser.accessToken) {
        throw new Error('Access token not available');
      }

      const response = await fetch(`${BASE_URL}/rbac/permissions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testUser.accessToken}`,
        },
      });

      // May require admin role
      expect([200, 401, 403]).toContain(response.status);
    }, TEST_TIMEOUT);
  });

  afterAll(async () => {
    // Cleanup: Delete test users if needed
    // This would require admin access or cleanup endpoint
  });
});
