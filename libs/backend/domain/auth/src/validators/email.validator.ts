import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

/**
 * Email validator with strict validation
 * Requires TLD and proper email format
 */
@ValidatorConstraint({ async: false })
export class IsValidEmailConstraint implements ValidatorConstraintInterface {
  validate(email: string, _args: ValidationArguments): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    // Basic email regex with TLD requirement
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

    if (!emailRegex.test(email)) {
      return false;
    }

    // Ensure TLD exists (at least 2 characters after last dot)
    const parts = email.split('@');
    if (parts.length !== 2) {
      return false;
    }

    const domain: string | undefined = parts[1];
    if (!domain) {
      return false;
    }
    const domainParts: string[] = domain.split('.');

    // Must have at least domain and TLD
    if (domainParts.length < 2) {
      return false;
    }

    // TLD must be at least 2 characters
    const tld: string | undefined = domainParts[domainParts.length - 1];
    if (!tld || tld.length < 2) {
      return false;
    }

    return true;
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Invalid email format. Email must contain a valid domain and TLD (e.g., user@example.com)';
  }
}

/**
 * Decorator for strict email validation
 */
export function IsValidEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    const decoratorOptions: {
      target: Function;
      propertyName: string;
      options?: ValidationOptions;
      constraints: never[];
      validator: typeof IsValidEmailConstraint;
    } = {
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      validator: IsValidEmailConstraint,
    };
    if (validationOptions !== undefined) {
      decoratorOptions.options = validationOptions;
    }
    registerDecorator(decoratorOptions);
  };
}
