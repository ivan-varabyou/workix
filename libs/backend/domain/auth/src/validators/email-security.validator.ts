import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import validator from 'validator';

/**
 * Email Security Validator
 * Validates that email doesn't contain CRLF injection, header injection, or other dangerous patterns
 */
@ValidatorConstraint({ async: false })
export class IsSecureEmailConstraint implements ValidatorConstraintInterface {
  validate(email: string, _args: ValidationArguments): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    // Decode URL-encoded characters first to catch encoded CRLF
    let decodedEmail: string = email;
    try {
      decodedEmail = decodeURIComponent(email);
    } catch {
      // If decoding fails, use original email
      decodedEmail = email;
    }

    // Check for CRLF injection (carriage return and line feed) - both raw and encoded
    if (/[\r\n]/.test(decodedEmail) || /[\r\n]/.test(email)) {
      return false;
    }

    // Check for null bytes
    if (/\0/.test(email)) {
      return false;
    }

    // Check for email header injection patterns - both in original and decoded
    const headerInjectionPatterns = [
      /%0d%0a/i,
      /%0a/i,
      /%0d/i,
      /\r\n/i,
      /\n/i,
      /\r/i,
      /Subject:/i,
      /Bcc:/i,
      /Cc:/i,
      /To:/i,
      /From:/i,
    ];

    for (const pattern of headerInjectionPatterns) {
      if (pattern.test(email) || pattern.test(decodedEmail)) {
        return false;
      }
    }

    // Use validator library for email format validation with strict options
    // Use decoded email for validation
    if (!validator.isEmail(decodedEmail, {
      allow_utf8_local_part: false,
      require_tld: true,
      allow_ip_domain: false,
      domain_specific_validation: true,
    })) {
      return false;
    }

    // Additional check: ensure email doesn't contain SQL injection patterns
    const sqlPatterns = [
      /'[\s]*OR[\s]*['"]?1['"]?[\s]*=[\s]*['"]?1['"]?/i,
      /'[\s]*UNION[\s]+SELECT/i,
      /'[\s]*--/,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(email) || pattern.test(decodedEmail)) {
        return false;
      }
    }

    // Check for command injection patterns
    // Check before @ symbol (local part) for command injection
    const localPart: string | undefined = email.split('@')[0];
    const decodedLocalPart: string | undefined = decodedEmail.split('@')[0];

    if (localPart || decodedLocalPart) {
      const commandPatterns = [
        /[;&|`$]/,
        /\$\(/,
        /`[^`]*`/,
        /\|\|/,
        /&&/,
        /;\s*\w+/,
        /\|\s*\w+/,
        /&&\s*\w+/,
        /\|\|\s*\w+/,
      ];

      for (const pattern of commandPatterns) {
        if ((localPart && pattern.test(localPart)) || (decodedLocalPart && pattern.test(decodedLocalPart))) {
          return false;
        }
      }
    }

    return true;
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Email contains invalid or dangerous characters';
  }
}

/**
 * Decorator for secure email validation
 */
export function IsSecureEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      ...(validationOptions ? { options: validationOptions } : {}),
      constraints: [],
      validator: IsSecureEmailConstraint,
    });
  };
}
