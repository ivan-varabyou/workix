// DTO interfaces for API keys

export interface GenerateApiKeyDto {
  name: string;
  permissions?: string[];
  expiresInDays?: number;
}

export interface UpdateApiKeyDto {
  name?: string;
  permissions?: string[];
  rateLimit?: number;
  expiresAt?: Date;
  active?: boolean;
}

export interface User {
  userId: string;
  email?: string;
  [key: string]: string | undefined;
}
