// I18n service interface for auth module

export interface I18nAuthService {
  translate(key: string, ...args: Array<string | number | boolean>): string;
}
