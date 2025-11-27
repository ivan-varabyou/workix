// Config exports
export { createDatabaseModule, DatabaseUtilsModule } from './config/database.module';
export { default as getDataSourceConfig } from './config/typeorm.config';

// Services exports
export { MigrationService } from './services/migration.service';
export { SeederService } from './services/seeder.service';

// Migrations exports (for referencing in DataSourceOptions)
// NOTE: Migrations removed - using Prisma migrations instead
// These exports are kept for backward compatibility but are not used
// export { CreateUsers1699254000000 } from './migrations/001-create-users';
// export { CreateSocialAccounts1699254001000 } from './migrations/002-create-social-accounts';
// export { CreatePhoneOtps1699254002000 } from './migrations/003-create-phone-otps';
// export { CreateEmailVerifications1699254003000 } from './migrations/004-create-email-verifications';
// export { CreateUserProfiles1699254004000 } from './migrations/005-create-user-profiles';
// export { CreateRoles1699254005000 } from './migrations/006-create-roles';
// export { CreatePermissions1699254006000 } from './migrations/007-create-permissions';
// export { CreateRolePermissions1699254007000 } from './migrations/008-create-role-permissions';
// export { CreateUserRoles1699254008000 } from './migrations/009-create-user-roles';
// export { CreatePipelines1699254009000 } from './migrations/010-create-pipelines';
// export { CreateSteps1699254010000 } from './migrations/011-create-steps';
