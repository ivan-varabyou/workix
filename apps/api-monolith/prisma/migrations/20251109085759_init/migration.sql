-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('google', 'apple', 'github');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'suspended', 'deleted');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('pending', 'running', 'success', 'failed', 'timeout');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_accounts" (
    "id" UUID NOT NULL,
    "provider" "Provider" NOT NULL,
    "providerAccountId" VARCHAR(500) NOT NULL,
    "email" VARCHAR(255),
    "displayName" VARCHAR(255),
    "profilePicture" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP,
    "metadata" JSONB DEFAULT '{}',
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_otps" (
    "id" UUID NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "expiresAt" TIMESTAMP NOT NULL,
    "verifiedAt" TIMESTAMP,
    "lockedUntil" TIMESTAMP,
    "metadata" JSONB DEFAULT '{}',
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phone_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verifications" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "verifiedAt" TIMESTAMP,
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "maxResends" INTEGER NOT NULL DEFAULT 5,
    "lastResendAt" TIMESTAMP,
    "userId" UUID,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "avatarFileKey" VARCHAR(255),
    "phoneNumber" VARCHAR(20),
    "dateOfBirth" DATE,
    "location" VARCHAR(255),
    "website" VARCHAR(255),
    "preferences" JSONB DEFAULT '{}',
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipelines" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL DEFAULT '{"version":"1.0","name":"","nodes":[],"edges":[]}',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "lastExecutedAt" TIMESTAMP,
    "category" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP,

    CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executions" (
    "id" UUID NOT NULL,
    "pipelineId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'pending',
    "inputs" JSONB DEFAULT '{}',
    "outputs" JSONB DEFAULT '{}',
    "stepResults" JSONB DEFAULT '{}',
    "error" TEXT,
    "errorMessage" TEXT,
    "durationMs" INTEGER,
    "stepsExecuted" INTEGER NOT NULL DEFAULT 0,
    "stepsFailed" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "result" JSONB DEFAULT '{}',
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "level" INTEGER NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "resource" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "assignedBy" VARCHAR(100),
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_providers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "apiKey" TEXT,
    "baseUrl" VARCHAR(500),
    "config" JSONB DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_models" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "modelId" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "config" JSONB DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_executions" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "modelId" UUID,
    "taskType" VARCHAR(100) NOT NULL,
    "input" JSONB DEFAULT '{}',
    "output" JSONB DEFAULT '{}',
    "status" VARCHAR(50) NOT NULL,
    "error" TEXT,
    "latencyMs" INTEGER,
    "tokensUsed" INTEGER,
    "cost" DECIMAL(10,4),
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_providers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "config" JSONB DEFAULT '{}',
    "credentials" JSONB DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_events" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "payload" JSONB DEFAULT '{}',
    "status" VARCHAR(50) NOT NULL,
    "error" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_workers" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "config" JSONB DEFAULT '{}',
    "status" VARCHAR(50) NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_tests" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "variants" JSONB NOT NULL DEFAULT '[]',
    "config" JSONB DEFAULT '{}',
    "status" VARCHAR(50) NOT NULL,
    "results" JSONB DEFAULT '{}',
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RolePermissions" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_RolePermissions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_user_created" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "idx_social_account_user" ON "social_accounts"("userId");

-- CreateIndex
CREATE INDEX "idx_social_account_provider" ON "social_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "idx_phone_otp_phone" ON "phone_otps"("phoneNumber");

-- CreateIndex
CREATE INDEX "idx_phone_otp_code" ON "phone_otps"("code");

-- CreateIndex
CREATE INDEX "idx_phone_otp_expires" ON "phone_otps"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "email_verifications_token_key" ON "email_verifications"("token");

-- CreateIndex
CREATE INDEX "idx_email_verification_email" ON "email_verifications"("email");

-- CreateIndex
CREATE INDEX "idx_email_verification_token" ON "email_verifications"("token");

-- CreateIndex
CREATE INDEX "idx_email_verification_expires" ON "email_verifications"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "idx_user_profile_userid" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "idx_pipeline_user_active" ON "pipelines"("userId", "isActive");

-- CreateIndex
CREATE INDEX "idx_pipeline_user_created" ON "pipelines"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_pipeline_public_active" ON "pipelines"("isPublic", "isActive");

-- CreateIndex
CREATE INDEX "idx_execution_pipeline" ON "executions"("pipelineId");

-- CreateIndex
CREATE INDEX "idx_execution_user" ON "executions"("userId");

-- CreateIndex
CREATE INDEX "idx_execution_status" ON "executions"("status");

-- CreateIndex
CREATE INDEX "idx_execution_created" ON "executions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE INDEX "idx_user_role_user" ON "user_roles"("userId");

-- CreateIndex
CREATE INDEX "idx_user_role_role" ON "user_roles"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_providers_name_key" ON "ai_providers"("name");

-- CreateIndex
CREATE INDEX "idx_ai_model_provider" ON "ai_models"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_models_providerId_modelId_key" ON "ai_models"("providerId", "modelId");

-- CreateIndex
CREATE INDEX "idx_ai_execution_provider" ON "ai_executions"("providerId");

-- CreateIndex
CREATE INDEX "idx_ai_execution_model" ON "ai_executions"("modelId");

-- CreateIndex
CREATE INDEX "idx_ai_execution_task" ON "ai_executions"("taskType");

-- CreateIndex
CREATE INDEX "idx_ai_execution_status" ON "ai_executions"("status");

-- CreateIndex
CREATE INDEX "idx_ai_execution_created" ON "ai_executions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "integration_providers_name_key" ON "integration_providers"("name");

-- CreateIndex
CREATE INDEX "idx_integration_event_provider" ON "integration_events"("providerId");

-- CreateIndex
CREATE INDEX "idx_integration_event_type" ON "integration_events"("eventType");

-- CreateIndex
CREATE INDEX "idx_integration_event_status" ON "integration_events"("status");

-- CreateIndex
CREATE INDEX "idx_integration_event_created" ON "integration_events"("createdAt");

-- CreateIndex
CREATE INDEX "idx_virtual_worker_user" ON "virtual_workers"("userId");

-- CreateIndex
CREATE INDEX "idx_virtual_worker_type" ON "virtual_workers"("type");

-- CreateIndex
CREATE INDEX "idx_virtual_worker_status" ON "virtual_workers"("status");

-- CreateIndex
CREATE INDEX "idx_ab_test_user" ON "ab_tests"("userId");

-- CreateIndex
CREATE INDEX "idx_ab_test_status" ON "ab_tests"("status");

-- CreateIndex
CREATE INDEX "_RolePermissions_B_index" ON "_RolePermissions"("B");

-- AddForeignKey
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_otps" ADD CONSTRAINT "phone_otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executions" ADD CONSTRAINT "executions_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executions" ADD CONSTRAINT "executions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_models" ADD CONSTRAINT "ai_models_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ai_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_executions" ADD CONSTRAINT "ai_executions_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ai_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_executions" ADD CONSTRAINT "ai_executions_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ai_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_events" ADD CONSTRAINT "integration_events_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "integration_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolePermissions" ADD CONSTRAINT "_RolePermissions_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolePermissions" ADD CONSTRAINT "_RolePermissions_B_fkey" FOREIGN KEY ("B") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
