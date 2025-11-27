/**
 * User Interface
 */
export interface IUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

/**
 * User Profile Interface
 */
export interface IUserProfile extends IUser {
  sessionCount: number;
  deviceCount: number;
}

/**
 * User Statistics Interface
 */
export interface IUserStats {
  total: number;
  active: number;
  inactive: number;
  activeRate: string;
}
