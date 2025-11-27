// User interface for CurrentUser decorator

export interface CurrentUser {
  userId: string;
  email?: string;
  [key: string]: string | number | boolean | undefined;
}
