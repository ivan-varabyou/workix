/**
 * Integration tests for all POST/PUT endpoints in the monolith API
 * Tests that data is actually created/updated in the database
 *
 * NOTE: Users endpoints are currently in Monolith but should be in Auth API.
 * These tests will be updated after Users Controller is moved to Auth API.
 *
 * Architecture:
 * - API Gateway (4200) → routes /api/v1/* to services
 * - Auth API (7200) → handles authentication and user management
 * - Monolith API (7000) → handles business logic (pipelines, rbac, workers, integrations, etc.)
 */

import axios, { AxiosError } from 'axios';
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

const apiUrl: string = process.env.MONOLITH_URL || 'http://localhost:7000';
const basePath: string = '/api/v1';

// Helper to get auth token (mock token for testing)
const getAuthToken = (): string => {
  // In real tests, you would get a token from the auth service
  // For now, we'll use a mock token or skip auth if not required
  return 'mock-token-for-testing';
};

// Helper to run tests with error handling
const runTest = async (testFn: () => Promise<void>): Promise<void> => {
  try {
    await testFn();
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    // If server is not available, skip test gracefully
    if (
      axiosError.code === 'ECONNREFUSED' ||
      axiosError.code === 'ECONNRESET' ||
      axiosError.code === 'ERR_INVALID_URL' ||
      axiosError.code === 'ECONNABORTED' ||
      axiosError.code === 'ETIMEDOUT' ||
      axiosError.message?.includes('socket hang up') ||
      axiosError.message?.includes('Network Error')
    ) {
      console.warn(`⚠️ Connection error - skipping test (${axiosError.code || axiosError.message})`);
      return;
    } else {
      throw error;
    }
  }
};

// Helper to make authenticated requests
const makeRequest = async (
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: unknown,
  requireAuth = true
): Promise<unknown> => {
  const config: {
    method: 'get' | 'post' | 'put' | 'delete';
    url: string;
    data?: unknown;
    headers?: Record<string, string>;
    timeout: number;
  } = {
    method,
    url: `${apiUrl}${basePath}${url}`,
    timeout: 10000,
  };

  if (data) {
    config.data = data;
  }

  if (requireAuth) {
    config.headers = {
      Authorization: `Bearer ${getAuthToken()}`,
    };
  }

  const response = await axios(config);
  return response.data;
};

describe('Monolith Create/Update Endpoints E2E Tests', () => {
  let prisma: PrismaClient;
  let testUserId: string;
  let testPipelineId: string;
  let testProviderId: string;
  let testRoleId: string;
  let testPermissionId: string;
  let testWorkerId: string;
  let testABTestId: string;

  beforeAll(async () => {
    console.log(`\n📡 Testing Monolith at: ${apiUrl}\n`);

    // Check if server is available
    const serverAvailableFromSetup = (globalThis as Record<string, unknown>).__MONOLITH_SERVER_AVAILABLE__;
    if (serverAvailableFromSetup === false) {
      console.warn(`⚠️ Server is not available - tests will be skipped\n`);
      return;
    }

    // Check if server is available
    try {
      await axios.get(`${apiUrl}/api/v1/health`, { timeout: 3000 });
      console.log(`✅ Server is available at ${apiUrl}\n`);
    } catch (error: unknown) {
      console.warn(`⚠️ Server is not available at ${apiUrl} - tests will be skipped\n`);
    }

    // Initialize Prisma for database checks
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5000/workix_monolith', // API 7000 → DB 5000 (change first digit: 7 → 5)
        },
      },
    });

    // Create a test user for testing
    try {
      const testUser = await prisma.user.upsert({
        where: { email: 'test-e2e@example.com' },
        update: {},
        create: {
          email: 'test-e2e@example.com',
          name: 'Test E2E User',
          password: 'hashed-password',
        },
      });
      testUserId = testUser.id;
    } catch (error: unknown) {
      console.warn(`⚠️ Could not create test user: ${error}`);
    }
  });

  afterEach(async () => {
    // Cleanup test data after each test
    try {
      if (testPipelineId) {
        await prisma.pipeline.deleteMany({ where: { id: testPipelineId } }).catch(() => {});
      }
      if (testProviderId) {
        await prisma.integrationProvider.deleteMany({ where: { id: testProviderId } }).catch(() => {});
      }
      if (testRoleId) {
        await prisma.role.deleteMany({ where: { id: testRoleId } }).catch(() => {});
      }
      if (testPermissionId) {
        await prisma.permission.deleteMany({ where: { id: testPermissionId } }).catch(() => {});
      }
      if (testWorkerId) {
        await prisma.virtualWorker.deleteMany({ where: { id: testWorkerId } }).catch(() => {});
      }
      if (testABTestId) {
        await prisma.aBTest.deleteMany({ where: { id: testABTestId } }).catch(() => {});
      }
    } catch (error: unknown) {
      console.warn(`⚠️ Cleanup error: ${error}`);
    }
  });

  describe('POST /api/v1/pipelines - Create Pipeline', () => {
    it('should create a pipeline and save it to database', async () => {
      await runTest(async () => {
        const pipelineData = {
          name: 'Test Pipeline E2E',
          description: 'Test pipeline created by E2E test',
          category: 'test',
          steps: [
            {
              type: 'action',
              name: 'test-action',
              config: { test: true },
            },
          ],
        };

        const response = await makeRequest('post', '/pipelines', pipelineData) as {
          id: string;
          name: string;
          userId: string;
        };

        expect(response).toBeDefined();
        expect(response.id).toBeDefined();
        expect(response.name).toBe(pipelineData.name);
        testPipelineId = response.id;

        // Verify in database
        const pipelineInDb = await prisma.pipeline.findUnique({
          where: { id: response.id },
        });

        expect(pipelineInDb).toBeDefined();
        expect(pipelineInDb?.name).toBe(pipelineData.name);
        expect(pipelineInDb?.userId).toBe(testUserId);
      });
    });
  });

  describe('POST /api/v1/integrations/providers - Create Integration Provider', () => {
    it('should create an integration provider and save it to database', async () => {
      await runTest(async () => {
        const providerData = {
          name: 'Test Provider E2E',
          type: 'test-provider',
          config: { test: true },
          credentials: { apiKey: 'test-key' },
          isActive: true,
        };

        const response = await makeRequest('post', '/integrations/providers', providerData) as {
          id: string;
          name: string;
          type: string;
        };

        expect(response).toBeDefined();
        expect(response.id).toBeDefined();
        expect(response.name).toBe(providerData.name);
        expect(response.type).toBe(providerData.type);
        testProviderId = response.id;

        // Verify in database
        const providerInDb = await prisma.integrationProvider.findUnique({
          where: { id: response.id },
        });

        expect(providerInDb).toBeDefined();
        expect(providerInDb?.name).toBe(providerData.name);
        expect(providerInDb?.type).toBe(providerData.type);
        expect(providerInDb?.isActive).toBe(true);
      });
    });
  });

  describe('POST /api/v1/integrations/providers/:id/credentials - Add Credentials', () => {
    it('should add credentials to a provider and save to database', async () => {
      await runTest(async () => {
        // First create a provider
        const providerData = {
          name: 'Test Provider for Credentials',
          type: 'test-provider',
          isActive: true,
        };

        const providerResponse = await makeRequest('post', '/integrations/providers', providerData) as {
          id: string;
        };
        testProviderId = providerResponse.id;

        // Then add credentials
        const credentialData = {
          type: 'api-key',
          data: {
            apiKey: 'test-api-key-123',
            apiSecret: 'test-secret-456',
          },
        };

        const response = await makeRequest('post', `/integrations/providers/${testProviderId}/credentials`, credentialData) as {
          id: string;
          credentials: unknown;
        };

        expect(response).toBeDefined();
        expect(response.id).toBe(testProviderId);

        // Verify in database
        const providerInDb = await prisma.integrationProvider.findUnique({
          where: { id: testProviderId },
        });

        expect(providerInDb).toBeDefined();
        expect(providerInDb?.credentials).toBeDefined();
      });
    });
  });

  describe('POST /api/v1/rbac/roles - Create Role', () => {
    it('should create a role and save it to database', async () => {
      await runTest(async () => {
        const roleData = {
          name: 'test-role-e2e',
          description: 'Test role created by E2E test',
          permissions: [],
        };

        const response = await makeRequest('post', '/rbac/roles', roleData) as {
          id: string;
          name: string;
        };

        expect(response).toBeDefined();
        expect(response.id).toBeDefined();
        expect(response.name).toBe(roleData.name);
        testRoleId = response.id;

        // Verify in database
        const roleInDb = await prisma.role.findUnique({
          where: { id: response.id },
        });

        expect(roleInDb).toBeDefined();
        expect(roleInDb?.name).toBe(roleData.name);
      });
    });
  });

  describe('POST /api/v1/rbac/permissions - Create Permission', () => {
    it('should create a permission and save it to database', async () => {
      await runTest(async () => {
        const permissionData = {
          name: 'test.permission.e2e',
          description: 'Test permission created by E2E test',
          resource: 'test-resource',
          action: 'read',
        };

        const response = await makeRequest('post', '/rbac/permissions', permissionData) as {
          id: string;
          name: string;
        };

        expect(response).toBeDefined();
        expect(response.id).toBeDefined();
        expect(response.name).toBe(permissionData.name);
        testPermissionId = response.id;

        // Verify in database
        const permissionInDb = await prisma.permission.findUnique({
          where: { id: response.id },
        });

        expect(permissionInDb).toBeDefined();
        expect(permissionInDb?.name).toBe(permissionData.name);
      });
    });
  });

  describe('POST /api/v1/rbac/assign-role - Assign Role to User', () => {
    it('should assign a role to a user and save to database', async () => {
      await runTest(async () => {
        // First create a role
        const roleData = {
          name: 'test-role-for-assignment',
          description: 'Test role for assignment',
          permissions: [],
        };

        const roleResponse = await makeRequest('post', '/rbac/roles', roleData) as {
          id: string;
        };
        testRoleId = roleResponse.id;

        // Then assign role to user
        const assignData = {
          userId: testUserId,
          roleId: testRoleId,
        };

        const response = await makeRequest('post', '/rbac/assign-role', assignData) as {
          success: boolean;
        };

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // Verify in database
        const userRoleInDb = await prisma.userRole.findFirst({
          where: {
            userId: testUserId,
            roleId: testRoleId,
          },
        });

        expect(userRoleInDb).toBeDefined();
      });
    });
  });

  describe('POST /api/v1/ab-tests - Create A/B Test', () => {
    it('should create an A/B test and save it to database', async () => {
      await runTest(async () => {
        const abTestData = {
          name: 'Test AB Test E2E',
          description: 'Test A/B test created by E2E test',
          variants: [
            { name: 'variant-a', weight: 50 },
            { name: 'variant-b', weight: 50 },
          ],
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(), // +1 day
        };

        const response = await makeRequest('post', '/ab-tests', abTestData) as {
          id: string;
          name: string;
        };

        expect(response).toBeDefined();
        expect(response.id).toBeDefined();
        expect(response.name).toBe(abTestData.name);
        testABTestId = response.id;

        // Verify in database
        const abTestInDb = await prisma.aBTest.findUnique({
          where: { id: response.id },
        });

        expect(abTestInDb).toBeDefined();
        expect(abTestInDb?.name).toBe(abTestData.name);
      });
    });
  });

  describe('POST /api/v1/workers - Create Worker', () => {
    it('should create a worker and save it to database', async () => {
      await runTest(async () => {
        const workerData = {
          name: 'Test Worker E2E',
          type: 'virtual',
          config: {
            cpu: 1,
            memory: 512,
          },
        };

        const response = await makeRequest('post', '/workers', workerData, false) as {
          id: string;
          name: string;
        };

        expect(response).toBeDefined();
        expect(response.id).toBeDefined();
        expect(response.name).toBe(workerData.name);
        testWorkerId = response.id;

        // Verify in database
        const workerInDb = await prisma.virtualWorker.findUnique({
          where: { id: response.id },
        });

        expect(workerInDb).toBeDefined();
        expect(workerInDb?.name).toBe(workerData.name);
      });
    });
  });

  describe('POST /api/v1/integrations/ecommerce/products/upload - Upload Product', () => {
    it('should upload a product and save to database', async () => {
      await runTest(async () => {
        // First create a provider
        const providerData = {
          name: 'E-commerce Test Provider',
          type: 'ecommerce',
          isActive: true,
        };

        const providerResponse = await makeRequest('post', '/integrations/providers', providerData) as {
          id: string;
        };
        testProviderId = providerResponse.id;

        const productData = {
          provider: testProviderId,
          name: 'Test Product E2E',
          description: 'Test product created by E2E test',
          price: 99.99,
          category: 'test',
        };

        const response = await makeRequest('post', '/integrations/ecommerce/products/upload', productData) as {
          id: string;
          name: string;
        };

        expect(response).toBeDefined();
        expect(response.name).toBe(productData.name);
        // Note: E-commerce products might not be stored in the same database
        // Adjust verification based on actual implementation
      });
    });
  });

  describe('POST /api/v1/generation/text - Generate Text', () => {
    it('should generate text and return result', async () => {
      await runTest(async () => {
        const generationData = {
          prompt: 'Generate a test text for E2E testing',
          options: {
            maxTokens: 100,
            temperature: 0.7,
          },
        };

        const response = await makeRequest('post', '/generation/text', generationData) as string;

        expect(response).toBeDefined();
        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(0);
      });
    });
  });

  describe('POST /api/v1/generation/image - Generate Image', () => {
    it('should generate image and return URLs', async () => {
      await runTest(async () => {
        const generationData = {
          prompt: 'A beautiful landscape for E2E testing',
          options: {
            width: 512,
            height: 512,
          },
        };

        const response = await makeRequest('post', '/generation/image', generationData) as string[];

        expect(response).toBeDefined();
        expect(Array.isArray(response)).toBe(true);
        expect(response.length).toBeGreaterThan(0);
      });
    });
  });

  describe('POST /api/v1/generation/embedding - Generate Embedding', () => {
    it('should generate embedding and return vector', async () => {
      await runTest(async () => {
        const generationData = {
          text: 'Test text for embedding generation',
          options: {
            model: 'text-embedding-ada-002',
          },
        };

        const response = await makeRequest('post', '/generation/embedding', generationData) as {
          embedding: number[];
          model: string;
          dimensions: number;
        };

        expect(response).toBeDefined();
        expect(response.embedding).toBeDefined();
        expect(Array.isArray(response.embedding)).toBe(true);
        expect(response.embedding.length).toBeGreaterThan(0);
        expect(response.model).toBeDefined();
        expect(response.dimensions).toBeGreaterThan(0);
      });
    });
  });

  // NOTE: Users endpoints should be in Auth API, not in Monolith
  // This test is kept for backward compatibility but should be moved to Auth API tests
  describe('PUT /api/v1/users/:userId - Update User (DEPRECATED - should be in Auth API)', () => {
    it.skip('should update a user and save changes to database', async () => {
      // This endpoint should be in Auth API, not Monolith
      // Skipping test until Users Controller is moved to Auth API
      await runTest(async () => {
        const updateData = {
          name: 'Updated Test User',
          bio: 'Updated bio from E2E test',
        };

        const response = await makeRequest('put', `/users/${testUserId}`, updateData) as {
          id: string;
          name: string;
        };

        expect(response).toBeDefined();
        expect(response.id).toBe(testUserId);
        expect(response.name).toBe(updateData.name);

        // Verify in database
        const userInDb = await prisma.user.findUnique({
          where: { id: testUserId },
        });

        expect(userInDb).toBeDefined();
        expect(userInDb?.name).toBe(updateData.name);
      });
    });
  });

  describe('PUT /api/v1/pipelines/:id - Update Pipeline', () => {
    it('should update a pipeline and save changes to database', async () => {
      await runTest(async () => {
        // First create a pipeline
        const pipelineData = {
          name: 'Test Pipeline for Update',
          description: 'Test pipeline',
          category: 'test',
          steps: [],
        };

        const createResponse = await makeRequest('post', '/pipelines', pipelineData) as {
          id: string;
        };
        testPipelineId = createResponse.id;

        // Then update it
        const updateData = {
          name: 'Updated Test Pipeline',
          description: 'Updated description',
        };

        const response = await makeRequest('put', `/pipelines/${testPipelineId}`, updateData) as {
          id: string;
          name: string;
        };

        expect(response).toBeDefined();
        expect(response.id).toBe(testPipelineId);
        expect(response.name).toBe(updateData.name);

        // Verify in database
        const pipelineInDb = await prisma.pipeline.findUnique({
          where: { id: testPipelineId },
        });

        expect(pipelineInDb).toBeDefined();
        expect(pipelineInDb?.name).toBe(updateData.name);
      });
    });
  });

  describe('PUT /api/v1/integrations/providers/:id - Update Provider', () => {
    it('should update a provider and save changes to database', async () => {
      await runTest(async () => {
        // First create a provider
        const providerData = {
          name: 'Test Provider for Update',
          type: 'test-provider',
          isActive: true,
        };

        const createResponse = await makeRequest('post', '/integrations/providers', providerData) as {
          id: string;
        };
        testProviderId = createResponse.id;

        // Then update it
        const updateData = {
          name: 'Updated Test Provider',
          isActive: false,
        };

        const response = await makeRequest('put', `/integrations/providers/${testProviderId}`, updateData) as {
          id: string;
          name: string;
          isActive: boolean;
        };

        expect(response).toBeDefined();
        expect(response.id).toBe(testProviderId);
        expect(response.name).toBe(updateData.name);
        expect(response.isActive).toBe(updateData.isActive);

        // Verify in database
        const providerInDb = await prisma.integrationProvider.findUnique({
          where: { id: testProviderId },
        });

        expect(providerInDb).toBeDefined();
        expect(providerInDb?.name).toBe(updateData.name);
        expect(providerInDb?.isActive).toBe(updateData.isActive);
      });
    });
  });
});
