import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsUUID()
  userId?: string;

  @IsUUID()
  roleId?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsUUID()
  assignedBy?: string;
}
