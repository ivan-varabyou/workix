// Device information interfaces

export interface DeviceInfo {
  deviceName?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  userAgent?: string;
  ipAddress?: string;
  os?: string;
  browser?: string;
  osName?: string;
  osVersion?: string;
  browserName?: string;
  browserVersion?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
}

export interface BiometricData {
  type: 'fingerprint' | 'face';
  template: string;
  deviceId?: string;
  deviceName?: string;
}

export interface BiometricTemplate {
  id: string;
  userId: string;
  type: 'fingerprint' | 'face';
  templateHash: string;
  deviceId?: string | null;
  deviceName?: string | null;
  lastUsedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogDetails {
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: DeviceInfo;
  [key: string]: string | number | boolean | DeviceInfo | undefined;
}

export interface AuditLog {
  id: string;
  userId: string;
  eventType: string;
  details: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BiometricAttempt {
  id: string;
  userId: string;
  type?: 'fingerprint' | 'face' | null;
  success: boolean;
  deviceId?: string | null;
  errorMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuth2Token {
  id: string;
  userId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  refreshExpiresAt?: Date | null;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordReset {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  sessionId: string;
  deviceName: string | null;
  deviceType: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  lastActivityAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Device {
  id: string;
  userId: string;
  fingerprint: string;
  deviceName: string | null;
  deviceType: string | null;
  osName: string | null;
  osVersion: string | null;
  browserName: string | null;
  browserVersion: string | null;
  userAgent: string | null;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TwoFactorAuth {
  id: string;
  userId: string;
  secret: string;
  backupCodes: string[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
