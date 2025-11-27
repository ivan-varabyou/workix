#!/bin/bash
set -e

cd /home/ivan/git/workix

echo "🚀 Starting migration..."

# Create directories
mkdir -p libs/domain
mkdir -p libs/infrastructure
mkdir -p libs/integrations/{cloud,code,communication,project-management,core}
mkdir -p libs/integrations/e-commerce/{marketplaces,social-commerce,video-commerce,shared}
mkdir -p libs/ai
mkdir -p libs/utilities

# Domain
echo "Moving domain libraries..."
[ -d libs/auth ] && git mv libs/auth libs/domain/auth && echo "✅ auth"
[ -d libs/users ] && git mv libs/users libs/domain/users && echo "✅ users"
[ -d libs/pipelines ] && git mv libs/pipelines libs/domain/pipelines && echo "✅ pipelines"
[ -d libs/rbac ] && git mv libs/rbac libs/domain/rbac && echo "✅ rbac"
[ -d libs/webhooks ] && git mv libs/webhooks libs/domain/webhooks && echo "✅ webhooks"
[ -d libs/workflows ] && git mv libs/workflows libs/domain/workflows && echo "✅ workflows"
[ -d libs/workers ] && git mv libs/workers libs/domain/workers && echo "✅ workers"

# Infrastructure
echo "Moving infrastructure libraries..."
[ -d libs/database ] && git mv libs/database libs/infrastructure/database && echo "✅ database"
[ -d libs/prisma ] && git mv libs/prisma libs/infrastructure/prisma && echo "✅ prisma"
[ -d libs/message-broker ] && git mv libs/message-broker libs/infrastructure/message-broker && echo "✅ message-broker"
[ -d libs/i18n ] && git mv libs/i18n libs/infrastructure/i18n && echo "✅ i18n"
[ -d libs/notifications ] && git mv libs/notifications libs/infrastructure/notifications && echo "✅ notifications"
[ -d libs/api-keys ] && git mv libs/api-keys libs/infrastructure/api-keys && echo "✅ api-keys"
[ -d libs/testing ] && git mv libs/testing libs/infrastructure/testing && echo "✅ testing"
[ -d libs/service-discovery ] && git mv libs/service-discovery libs/infrastructure/service-discovery && echo "✅ service-discovery"
[ -d libs/performance ] && git mv libs/performance libs/infrastructure/performance && echo "✅ performance"

# Integrations - Cloud
echo "Moving cloud integrations..."
[ -d libs/aws-integration ] && git mv libs/aws-integration libs/integrations/cloud/aws && echo "✅ aws"
[ -d libs/azure-integration ] && git mv libs/azure-integration libs/integrations/cloud/azure && echo "✅ azure"
[ -d libs/gcp-integration ] && git mv libs/gcp-integration libs/integrations/cloud/gcp && echo "✅ gcp"

# Integrations - Code
echo "Moving code integrations..."
[ -d libs/github-integration ] && git mv libs/github-integration libs/integrations/code/github && echo "✅ github"
[ -d libs/gitlab-integration ] && git mv libs/gitlab-integration libs/integrations/code/gitlab && echo "✅ gitlab"

# Integrations - Communication
echo "Moving communication integrations..."
[ -d libs/slack-integration ] && git mv libs/slack-integration libs/integrations/communication/slack && echo "✅ slack"
[ -d libs/telegram-integration ] && git mv libs/telegram-integration libs/integrations/communication/telegram && echo "✅ telegram"

# Integrations - Project Management
echo "Moving project management integrations..."
[ -d libs/jira-integration ] && git mv libs/jira-integration libs/integrations/project-management/jira && echo "✅ jira"
[ -d libs/salesforce-integration ] && git mv libs/salesforce-integration libs/integrations/project-management/salesforce && echo "✅ salesforce"

# Integrations - Core
echo "Moving integration core..."
[ -d libs/integration-core ] && git mv libs/integration-core libs/integrations/core && echo "✅ integration-core"

# AI
echo "Moving AI libraries..."
[ -d libs/ai-core ] && git mv libs/ai-core libs/ai/ai-core && echo "✅ ai-core"
[ -d libs/generation ] && git mv libs/generation libs/ai/generation && echo "✅ generation"
[ -d libs/ml-integration ] && git mv libs/ml-integration libs/ai/ml-integration && echo "✅ ml-integration"

# Utilities
echo "Moving utilities libraries..."
[ -d libs/ab-testing ] && git mv libs/ab-testing libs/utilities/ab-testing && echo "✅ ab-testing"
[ -d libs/billing ] && git mv libs/billing libs/utilities/billing && echo "✅ billing"
[ -d libs/batch-processing ] && git mv libs/batch-processing libs/utilities/batch-processing && echo "✅ batch-processing"
[ -d libs/custom-scripts ] && git mv libs/custom-scripts libs/utilities/custom-scripts && echo "✅ custom-scripts"
[ -d libs/data-validation ] && git mv libs/data-validation libs/utilities/data-validation && echo "✅ data-validation"
[ -d libs/file-storage ] && git mv libs/file-storage libs/utilities/file-storage && echo "✅ file-storage"
[ -d libs/resilience ] && git mv libs/resilience libs/utilities/resilience && echo "✅ resilience"

echo "✅ Migration complete!"
