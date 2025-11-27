/**
 * Admin JWT Payload interfaces
 */

/**
 * Admin JWT Payload
 */
export interface AdminJwtPayload {
  adminId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// AdminTokensResponse moved to admin-jwt.service.ts for better organization
