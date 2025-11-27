import { IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @Length(3, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;

  @IsNumber()
  @Min(0)
  @Max(1000)
  level?: number;
}
