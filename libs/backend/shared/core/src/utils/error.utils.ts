/**
 * Error handling utilities
 * Safe error message extraction without using 'as' assertions
 */

/**
 * Type guard to check if error is an Error instance
 */
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if error has a message property
 */
function hasMessage(error: unknown): error is { message: string } {
  if (!error || typeof error !== 'object') return false;
  if (Array.isArray(error)) return false;
  const messageDesc = Object.getOwnPropertyDescriptor(error, 'message');
  return typeof messageDesc?.value === 'string';
}

/**
 * Safely extract error message from unknown error
 * @param error - Unknown error from catch block
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (hasMessage(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

/**
 * Safely extract error stack from unknown error
 * @param error - Unknown error from catch block
 * @returns Error stack string or undefined
 */
export function getErrorStack(error: unknown): string | undefined {
  if (isError(error)) {
    return error.stack;
  }
  return undefined;
}
