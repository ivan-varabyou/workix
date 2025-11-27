// OAuth profile interfaces

export interface OAuthProfile {
  id: string;
  displayName?: string;
  name?: {
    familyName?: string;
    givenName?: string;
  };
  emails?: Array<{
    value: string;
    verified?: boolean;
  }>;
  photos?: Array<{
    value: string;
  }>;
  provider: string;
  [key: string]:
    | string
    | number
    | boolean
    | { familyName?: string; givenName?: string }
    | Array<{ value: string; verified?: boolean }>
    | Array<{ value: string }>
    | undefined;
}

export interface AppleIdToken {
  sub: string;
  email?: string;
  email_verified?: boolean;
  [key: string]: string | number | boolean | undefined;
}
