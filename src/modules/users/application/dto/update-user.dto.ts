/**
 * Update User DTO
 * ----------------------------------------
 * - Validation errors → ErrorCode.VALIDATION_400
 * - Not found → ErrorCode.USER_NOT_FOUND
 *
 * DTO này chỉ đại diện INPUT từ client
 * Không chứa logic nghiệp vụ
 */
import { IsOptional, IsString, IsEmail, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Username đăng nhập',
    example: 'john.doe',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Email người dùng',
    example: 'john.doe@email.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Họ tên đầy đủ',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại',
    example: '0909123456',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'URL ảnh đại diện',
    example: 'https://cdn.xxx/avatar.png',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái user',
    enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'],
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'BLOCKED'])
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}
