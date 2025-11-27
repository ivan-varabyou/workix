// Register tsconfig paths for tsx
const { register } = require('tsconfig-paths');
const path = require('path');

// Base URL should be the workspace root
const baseUrl = path.resolve(__dirname, '../../');
const paths = {
  '@workix/database': ['libs/database/src/index.ts'],
  '@workix/domain/rbac': ['libs/rbac/src/index.ts'],
  '@workix/domain/pipelines': ['libs/pipelines/src/index.ts'],
  '@workix/shared': ['libs/shared/src/index.ts'],
  '@workix/domain/auth': ['libs/domain/auth/src/index.ts'],
};

const result = register({
  baseUrl,
  paths,
});

// Export for debugging
if (process.env.DEBUG) {
  console.log('tsconfig-paths registered:', { baseUrl, paths });
}
