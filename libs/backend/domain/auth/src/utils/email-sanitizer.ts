/**
 * Email Sanitizer
 * Removes dangerous characters and normalizes email addresses
 */

/**
 * Sanitize email address
 * Removes CRLF, null bytes, and other dangerous characters
 * Normalizes email (lowercase, trim)
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Remove CRLF (carriage return and line feed)
  let sanitized = email.replace(/[\r\n]/g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove other control characters (except space)
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Normalize: lowercase and trim
  sanitized = sanitized.toLowerCase().trim();

  // Remove leading/trailing dots (not allowed in email)
  sanitized = sanitized.replace(/^\.+|\.+$/g, '');

  // Remove multiple consecutive dots
  sanitized = sanitized.replace(/\.{2,}/g, '.');

  return sanitized;
}

/**
 * Validate email doesn't contain dangerous characters after sanitization
 */
export function isEmailSafe(email: string): boolean {
  const sanitized = sanitizeEmail(email);
  
  // Check if email still contains dangerous patterns after sanitization
  if (sanitized !== email.toLowerCase().trim().replace(/[\r\n\0]/g, '')) {
    return false;
  }

  // Check for CRLF injection attempts
  if (/[\r\n]/.test(email)) {
    return false;
  }

  // Check for null bytes
  if (/\0/.test(email)) {
    return false;
  }

  return true;
}

