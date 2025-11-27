// Settings interfaces for admin app

export interface GeneralSettings {
  siteName: string;
  siteDescription?: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

export interface SecuritySettings {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  sessionTimeout: number;
  twoFactorEnabled: boolean;
  loginAttemptsLimit: number;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: boolean;
  fromEmail: string;
  fromName: string;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  [key: string]: unknown;
}

export interface Settings {
  general?: GeneralSettings;
  security?: SecuritySettings;
  email?: EmailSettings;
  system?: SystemConfig;
}

export type UpdateGeneralSettingsDto = GeneralSettings;
export type UpdateSecuritySettingsDto = SecuritySettings;
export type UpdateEmailSettingsDto = EmailSettings;
export type UpdateSystemConfigDto = SystemConfig;

export interface TestEmailResult {
  success: boolean;
  message?: string;
  error?: string;
}
