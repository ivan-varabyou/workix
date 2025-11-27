/**
 * Common Passwords List
 * Top 100 most common passwords that should be rejected
 * Based on various security reports and breach databases
 */
export const COMMON_PASSWORDS: Set<string> = new Set([
  // Top 20 most common passwords
  'password',
  '123456',
  '123456789',
  '12345678',
  '12345',
  '1234567',
  '1234567890',
  'qwerty',
  'abc123',
  '111111',
  '123123',
  'admin',
  'letmein',
  'welcome',
  'monkey',
  '123456789',
  'password1',
  'qwerty123',
  '000000',
  '123qwe',

  // Common patterns
  'password123',
  'admin123',
  'root',
  'toor',
  'pass',
  'test',
  'guest',
  'info',
  'adm',
  'mysql',
  'user',
  'administrator',
  'oracle',
  'ftp',
  'pi',
  'puppet',
  'ansible',
  'ec2-user',
  'vagrant',
  'azureuser',

  // Common with year
  'password2024',
  'password2023',
  'password2022',
  'password2021',
  'password2020',
  'password2019',
  'password2018',

  // Common with numbers
  'password1',
  'password2',
  'password12',
  'password123',
  'password1234',
  'password12345',

  // Common variations
  'Password',
  'PASSWORD',
  'Password1',
  'Password123',
  'Password123!',
  'Password123@',
  'Password123#',
  'Password123$',
  'Passw0rd',
  'Passw0rd123',
  'Passw0rd123!',

  // Qwerty variations
  'Qwerty123',
  'Qwerty123!',
  'Qwerty123@',
  'Qwerty123#',
  'Qwerty123$',
  'Qwerty123!@#$',

  // Common words
  'welcome',
  'welcome123',
  'welcome1',
  'welcome1234',
  'letmein',
  'letmein123',
  'master',
  'master123',
  'sunshine',
  'princess',
  'dragon',
  'football',
  'iloveyou',
  'trustno1',
  '123456789a',
  'qwertyuiop',
  'qwerty123',
  'qwerty1234',
  'qwerty12345',

  // Common sequences
  '123456789',
  '987654321',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
  'qwerty123',
  'qwerty1234',
  'qwerty12345',

  // Common with special chars (but still weak)
  'password!',
  'password@',
  'password#',
  'password$',
  'password%',
  'password&',
  'password*',
  'password?',
  'password.',
  'password,',

  // Service-specific common passwords
  'changeme',
  'default',
  'secret',
  'private',
  'public',
  'temp',
  'temporary',
  'demo',
  'sample',
  'example',
]);

/**
 * Check if password is in common passwords list
 * Case-insensitive check
 */
export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}
