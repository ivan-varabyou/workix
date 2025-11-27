/**
 * Admin-related interfaces
 * Following project conventions: no inline types, use interfaces
 */

import type { Request } from 'express';

/**
 * Admin IP Whitelist entry
 */
export interface AdminIpWhitelistEntry {
  id: string;
  ipAddress: string;
  description: string | null;
  createdAt: Date;
}

/**
 * Admin IP Whitelist response
 */
export interface AdminIpWhitelistResponse {
  id: string;
  ipAddress: string;
}

/**
 * Audit log data for admin actions
 */
export interface AdminAuditLogData {
  adminId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Express request with admin context
 */
export interface AdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
  adminToken?: string;
}
