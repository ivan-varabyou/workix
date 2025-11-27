import { IsOptional, IsString, Length } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @Length(3, 100)
  name?: string; // e.g., 'users:read'

  @IsString()
  @Length(3, 50)
  resource?: string; // e.g., 'users'

  @IsString()
  @Length(3, 50)
  action?: string; // e.g., 'read'

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;
}
