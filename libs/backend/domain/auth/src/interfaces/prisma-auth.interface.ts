// Prisma service interfaces for auth module

import { PrismaClient } from '@prisma/client';

import type {
  AuditLog,
  BiometricAttempt,
  BiometricTemplate,
  Device,
  OAuth2Token,
  PasswordReset,
  Session,
  TwoFactorAuth,
} from './device.interface';

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type OAuthProvider = 'google' | 'apple' | 'github';

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type AuthPrismaService = PrismaClient & {
  user: {
    findUnique: (args: { where: { id?: string; email?: string } }) => Promise<User | null>;
    findFirst: (args: { where: { email?: string; id?: string } }) => Promise<User | null>;
    findMany: (args?: {
      where?: {
        email?: string;
        id?: string;
        emailVerified?: boolean;
      };
      orderBy?: {
        createdAt?: 'asc' | 'desc';
      };
      take?: number;
      skip?: number;
    }) => Promise<User[]>;
    create: (args: { data: UserCreateData }) => Promise<User>;
    update: (args: { where: { id: string }; data: UserUpdateData }) => Promise<User>;
    delete: (args: { where: { id: string } }) => Promise<User>;
    count: (args?: { where?: { email?: string; id?: string } }) => Promise<number>;
  };
  emailVerification: {
    findUnique: (args: { where: { id: string } }) => Promise<EmailVerification | null>;
    findFirst: (args: {
      where: {
        token?: string;
        email?: string;
        userId?: string;
        verifiedAt?: null;
      };
      orderBy?: {
        createdAt?: 'asc' | 'desc';
      };
    }) => Promise<EmailVerification | null>;
    findMany: (args?: {
      where?: {
        email?: string;
        userId?: string;
        verifiedAt?: null;
      };
      orderBy?: {
        createdAt?: 'asc' | 'desc';
      };
      take?: number;
    }) => Promise<EmailVerification[]>;
    create: (args: { data: EmailVerificationCreateData }) => Promise<EmailVerification>;
    update: (args: {
      where: { id: string };
      data: EmailVerificationUpdateData;
    }) => Promise<EmailVerification>;
    delete: (args: { where: { id: string } }) => Promise<EmailVerification>;
    count: (args?: { where?: { email?: string; userId?: string } }) => Promise<number>;
  };
  phoneOtp: {
    findUnique: (args: { where: { id: string } }) => Promise<PhoneOtp | null>;
    findFirst: (args: {
      where: {
        phoneNumber?: string;
        code?: string;
        verifiedAt?: null;
      };
      orderBy?: {
        createdAt?: 'asc' | 'desc';
      };
    }) => Promise<PhoneOtp | null>;
    findMany: (args?: {
      where?: {
        phoneNumber?: string;
        verifiedAt?: null;
      };
      orderBy?: {
        createdAt?: 'asc' | 'desc';
      };
      take?: number;
    }) => Promise<PhoneOtp[]>;
    create: (args: { data: PhoneOtpCreateData }) => Promise<PhoneOtp>;
    update: (args: { where: { id: string }; data: PhoneOtpUpdateData }) => Promise<PhoneOtp>;
    delete: (args: { where: { id: string } }) => Promise<PhoneOtp>;
    count: (args?: {
      where?: {
        phoneNumber?: string;
        createdAt?: { gt?: Date; gte?: Date; lt?: Date; lte?: Date };
      };
    }) => Promise<number>;
  };
  socialAccount: {
    findUnique: (args: { where: { id: string } }) => Promise<SocialAccount | null>;
    findFirst: (args: {
      where: {
        provider?: OAuthProvider;
        providerAccountId?: string;
        userId?: string;
      };
    }) => Promise<SocialAccount | null>;
    findMany: (args?: {
      where?: {
        provider?: OAuthProvider;
        userId?: string;
      };
      orderBy?: {
        createdAt?: 'asc' | 'desc';
      };
      take?: number;
      select?: {
        id?: boolean;
        provider?: boolean;
        email?: boolean;
        displayName?: boolean;
        profilePicture?: boolean;
        createdAt?: boolean;
      };
    }) => Promise<SocialAccount[]>;
    create: (args: { data: SocialAccountCreateData }) => Promise<SocialAccount>;
    update: (args: {
      where: { id: string };
      data: SocialAccountUpdateData;
    }) => Promise<SocialAccount>;
    delete: (args: { where: { id: string } }) => Promise<SocialAccount>;
    count: (args?: { where?: { provider?: OAuthProvider; userId?: string } }) => Promise<number>;
  };
  auditLog: {
    findMany: (args?: {
      where?: { userId?: string };
      orderBy?: { createdAt?: 'asc' | 'desc' };
      take?: number;
    }) => Promise<AuditLog[]>;
    create: (args: {
      data: {
        userId: string;
        eventType: string;
        details: string;
        ipAddress?: string | null;
        userAgent?: string | null;
      };
    }) => Promise<AuditLog>;
  };
  biometric: {
    findFirst: (args: {
      where: {
        id?: string;
        userId?: string;
        deviceId?: string;
        type?: 'fingerprint' | 'face';
        templateHash?: string;
      };
    }) => Promise<BiometricTemplate | null>;
    findMany: (args?: {
      where?: {
        userId?: string;
        deviceId?: string;
        type?: 'fingerprint' | 'face';
      };
      orderBy?: { createdAt?: 'asc' | 'desc' };
      take?: number;
      select?: {
        id?: boolean;
        type?: boolean;
        templateHash?: boolean;
        deviceId?: boolean;
        deviceName?: boolean;
        lastUsedAt?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
      };
    }) => Promise<BiometricTemplate[]>;
    create: (args: {
      data: {
        userId: string;
        type: 'fingerprint' | 'face';
        templateHash: string;
        deviceId?: string | null;
        deviceName?: string | null;
      };
    }) => Promise<BiometricTemplate>;
    update: (args: {
      where: { id: string };
      data: {
        templateHash?: string;
        deviceId?: string | null;
        lastUsedAt?: Date;
      };
    }) => Promise<BiometricTemplate>;
    delete: (args: { where: { id: string } }) => Promise<BiometricTemplate>;
    count: (args?: {
      where?: {
        userId?: string;
        deviceId?: string;
        type?: 'fingerprint' | 'face';
      };
    }) => Promise<number>;
  };
  biometricAttempt: {
    deleteMany: (args: {
      where: {
        createdAt?: { lt?: Date };
      };
    }) => Promise<{ count: number }>;
    count: (args: {
      where: {
        userId?: string;
        type?: 'fingerprint' | 'face';
        success?: boolean;
        createdAt?: { gte?: Date; gt?: Date };
      };
    }) => Promise<number>;
    create: (args: {
      data: {
        userId: string;
        type?: 'fingerprint' | 'face';
        success: boolean;
        deviceId?: string | null;
        errorMessage?: string | null;
      };
    }) => Promise<BiometricAttempt>;
  };
  oAuth2Token: {
    findFirst: (args: {
      where: {
        userId?: string;
        refreshToken?: string;
      };
    }) => Promise<OAuth2Token | null>;
    update: (args: {
      where: { id: string };
      data: {
        refreshToken?: string;
        refreshExpiresAt?: Date;
        revokedAt?: Date;
      };
    }) => Promise<OAuth2Token>;
    updateMany: (args: {
      where: {
        userId?: string;
        refreshToken?: string;
      };
      data: {
        revokedAt?: Date;
      };
    }) => Promise<{ count: number }>;
  };
  passwordReset: {
    count: (args: {
      where: {
        userId?: string;
        createdAt?: { gt?: Date };
        usedAt?: null;
      };
    }) => Promise<number>;
    create: (args: {
      data: {
        userId: string;
        token: string;
        expiresAt: Date;
      };
    }) => Promise<PasswordReset>;
    findFirst: (args: {
      where: {
        token?: string;
        usedAt?: null;
        userId?: string;
        expiresAt?: { gt?: Date };
      };
    }) => Promise<PasswordReset | null>;
    update: (args: {
      where: { id: string };
      data: {
        usedAt?: Date;
      };
    }) => Promise<PasswordReset>;
    updateMany: (args: {
      where: {
        userId?: string;
        id?: { not?: string } | string;
        usedAt?: null;
      };
      data: {
        usedAt?: Date;
      };
    }) => Promise<{ count: number }>;
    deleteMany: (args: {
      where: {
        expiresAt?: { lt?: Date };
        usedAt?: null;
      };
    }) => Promise<{ count: number }>;
  };
  session: {
    create: (args: {
      data: {
        userId: string;
        sessionId: string;
        deviceName?: string;
        deviceType?: string;
        userAgent?: string | null;
        ipAddress?: string | null;
        lastActivityAt?: Date;
      };
    }) => Promise<Session>;
    findMany: (args: {
      where: {
        userId?: string;
        revokedAt?: null;
      };
      orderBy?: { createdAt?: 'asc' | 'desc' };
      take?: number;
    }) => Promise<Session[]>;
    findFirst: (args: {
      where: {
        sessionId?: string;
        revokedAt?: null;
      };
    }) => Promise<Session | null>;
    update: (args: {
      where: { sessionId: string };
      data: {
        lastActivityAt?: Date;
        revokedAt?: Date;
      };
    }) => Promise<Session>;
    updateMany: (args: {
      where: {
        userId?: string;
        revokedAt?: null;
        sessionId?: { not?: string } | string;
      };
      data: {
        revokedAt?: Date;
      };
    }) => Promise<{ count: number }>;
    deleteMany: (args: {
      where: {
        createdAt?: { lt?: Date };
      };
    }) => Promise<{ count: number }>;
  };
  device: {
    findFirst: (args: {
      where: {
        userId?: string;
        fingerprint?: string;
        id?: string;
      };
    }) => Promise<Device | null>;
    findMany: (args: {
      where: {
        userId?: string;
      };
      orderBy?: { lastSeenAt?: 'asc' | 'desc' };
    }) => Promise<Device[]>;
    create: (args: {
      data: {
        userId: string;
        fingerprint: string;
        deviceName?: string | null;
        deviceType?: string | null;
        osName?: string | null;
        osVersion?: string | null;
        browserName?: string | null;
        browserVersion?: string | null;
        userAgent?: string | null;
        lastSeenAt?: Date;
      };
    }) => Promise<Device>;
    update: (args: {
      where: { id: string };
      data: {
        lastSeenAt?: Date;
      };
    }) => Promise<Device>;
    delete: (args: { where: { id: string } }) => Promise<Device>;
  };
  twoFactorAuth: {
    create: (args: {
      data: {
        userId: string;
        secret: string;
        backupCodes: string[];
        enabled: boolean;
      };
    }) => Promise<TwoFactorAuth>;
    findFirst: (args: {
      where: {
        userId?: string;
        enabled?: boolean;
      };
    }) => Promise<TwoFactorAuth | null>;
    update: (args: {
      where: { id: string };
      data: {
        backupCodes?: string[];
      };
    }) => Promise<TwoFactorAuth>;
    deleteMany: (args: {
      where: {
        userId?: string;
      };
    }) => Promise<{ count: number }>;
  };
  refreshToken: {
    findUnique: (args: { where: { id?: string; token?: string } }) => Promise<RefreshToken | null>;
    findFirst: (args: {
      where: {
        token?: string;
        userId?: string;
        revokedAt?: null;
      };
    }) => Promise<RefreshToken | null>;
    create: (args: {
      data: {
        token: string;
        userId: string;
        expiresAt: Date;
        revokedAt?: Date | null;
      };
    }) => Promise<RefreshToken>;
    update: (args: {
      where: { id?: string; token?: string };
      data: {
        revokedAt?: Date | null;
      };
    }) => Promise<RefreshToken>;
    updateMany: (args: {
      where: {
        userId?: string;
        revokedAt?: null;
      };
      data: {
        revokedAt?: Date;
      };
    }) => Promise<{ count: number }>;
    deleteMany: (args: {
      where: {
        expiresAt?: { lt?: Date };
      };
    }) => Promise<{ count: number }>;
  };
};

export interface User {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string | null;
  emailVerified: boolean;
  phone?: string | null | undefined;
  phoneVerified?: boolean | null | undefined;
  twoFactorEnabled?: boolean | null | undefined;
  biometricEnabled?: boolean | null | undefined;
  lockedUntil?: Date | null | undefined;
  failedLoginAttempts?: number | undefined;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null | undefined;
}

export interface UserCreateData {
  email: string;
  name?: string;
  passwordHash?: string;
  emailVerified?: boolean;
  phone?: string;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  biometricEnabled?: boolean;
}

export interface UserUpdateData {
  email?: string;
  name?: string;
  passwordHash?: string;
  emailVerified?: boolean;
  phone?: string;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  biometricEnabled?: boolean;
  lockedUntil?: Date | null;
  failedLoginAttempts?: number;
}

export interface EmailVerification {
  id: string;
  email: string;
  token: string;
  userId?: string | null;
  expiresAt: Date;
  verifiedAt?: Date | null;
  resendCount: number;
  maxResends: number;
  lastResendAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailVerificationCreateData {
  email: string;
  token: string;
  userId?: string;
  expiresAt: Date;
  resendCount?: number;
}

export interface EmailVerificationUpdateData {
  email?: string;
  token?: string;
  userId?: string;
  expiresAt?: Date;
  verifiedAt?: Date;
  resendCount?: number;
  maxResends?: number;
  lastResendAt?: Date | null;
}

export interface PhoneOtp {
  id: string;
  phoneNumber: string;
  code: string;
  expiresAt: Date;
  verifiedAt?: Date | null;
  attempts: number;
  maxAttempts: number;
  lockedUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhoneOtpCreateData {
  phoneNumber: string;
  code: string;
  expiresAt: Date;
  attempts?: number;
  maxAttempts?: number;
  lockedUntil?: Date | null;
}

export interface PhoneOtpUpdateData {
  phoneNumber?: string;
  code?: string;
  expiresAt?: Date;
  verifiedAt?: Date;
  attempts?: number;
  maxAttempts?: number;
  lockedUntil?: Date | null;
}

export interface SocialAccount {
  id: string;
  userId: string;
  provider: OAuthProvider;
  providerAccountId: string;
  email?: string | null;
  displayName?: string | null;
  profilePicture?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  metadata?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialAccountCreateData {
  userId: string;
  provider: OAuthProvider;
  providerAccountId: string;
  email?: string;
  displayName?: string;
  profilePicture?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  metadata?: unknown;
}

export interface SocialAccountUpdateData {
  userId?: string;
  provider?: OAuthProvider;
  providerAccountId?: string;
  email?: string;
  displayName?: string;
  profilePicture?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  metadata?: unknown;
}

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
