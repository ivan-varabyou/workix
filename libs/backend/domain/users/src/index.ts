// Main Module
export * from './users.module';

// Services
export * from './services/user-profile.service';

// DTOs
export {
  DeleteUserProfileResponseDto,
  SearchUsersDto,
  UpdateAvatarRequestBodyDto,
  UpdateUserProfileDto,
  UserListResponseDto,
  UserProfileResponseDto,
  UserSearchResultDto,
  UserStatsDto,
} from './dto/user-profile.dto';

// Interfaces
export * from './interfaces/user.interface';

// Prisma interfaces (for type usage only)
export type {
  UserListResponse as UserListResponsePrisma,
  UserProfile as UserProfilePrisma,
  UserSearchResult as UserSearchResultPrisma,
} from './interfaces/users-prisma.interface';

// Type aliases for backward compatibility
// eslint-disable-next-line @typescript-eslint/no-type-alias -- Required for backward compatibility with existing API contracts
export type UserListResponse = import('./dto/user-profile.dto').UserListResponseDto;
// eslint-disable-next-line @typescript-eslint/no-type-alias -- Required for backward compatibility with existing API contracts
export type UserProfile = import('./interfaces/user.interface').IUserProfile;
// eslint-disable-next-line @typescript-eslint/no-type-alias -- Required for backward compatibility with existing API contracts
export type UserSearchResult = import('./interfaces/user.interface').IUser;
