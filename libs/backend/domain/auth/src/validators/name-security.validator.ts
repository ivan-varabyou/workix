import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import validator from 'validator';

/**
 * Name Security Validator
 * Validates that name doesn't contain SQL injection, XSS, command injection patterns
 */
@ValidatorConstraint({ async: false })
export class IsSecureNameConstraint implements ValidatorConstraintInterface {
  validate(name: string, _args: ValidationArguments): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }

    // Check for SQL injection patterns
    const sqlPatterns = [
      /'[\s]*OR[\s]*['"]?1['"]?[\s]*=[\s]*['"]?1['"]?/i,
      /'[\s]*UNION[\s]+SELECT/i,
      /'[\s]*;[\s]*DROP[\s]+TABLE/i,
      /'[\s]*--/,
      /'[\s]*\/\*/,
      /'[\s]*#/,
      /'[\s]*OR[\s]*'a'[\s]*=[\s]*'a/i,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(name)) {
        return false;
      }
    }

    // Check for XSS patterns
    const xssPatterns = [
      /<script/i,
      /<iframe/i,
      /<img/i,
      /<svg/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<[^>]*>/,
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(name)) {
        return false;
      }
    }

    // Check for command injection patterns
    // Be more specific - don't block parentheses that might be in legitimate names
    const commandPatterns = [
      /[;&|`$]/,
      /\$\(/,
      /`[^`]*`/,
      /;\s*\w+/,
      /\|\s*\w+/,
      /&&\s*\w+/,
      /\|\|\s*\w+/,
      /;\s*ls/,
      /;\s*cat/,
      /;\s*rm/,
      /\|\s*ls/,
      /\|\s*cat/,
    ];

    for (const pattern of commandPatterns) {
      if (pattern.test(name)) {
        return false;
      }
    }

    // Check for CRLF and null bytes
    if (/[\r\n\0]/.test(name)) {
      return false;
    }

    // Use validator library to check for control characters
    if (!validator.isAscii(name)) {
      // Allow Unicode letters but check for control characters
      if (/[\x00-\x1F\x7F]/.test(name)) {
        return false;
      }
    }

    return true;
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Name contains invalid or dangerous characters';
  }
}

/**
 * Decorator for secure name validation
 */
export function IsSecureName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      ...(validationOptions ? { options: validationOptions } : {}),
      constraints: [],
      validator: IsSecureNameConstraint,
    });
  };
}
