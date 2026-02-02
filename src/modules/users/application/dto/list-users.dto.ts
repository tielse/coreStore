import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export class ListUsersDto {
  @ApiPropertyOptional({
    example: 'ADMIN',
    description: 'Filter theo group',
  })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({
    enum: UserStatus,
    description: 'Filter theo trạng thái user',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    example: 'john',
    description: 'Search theo username / email',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit = 20;
}
