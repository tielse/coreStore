import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({
    example: 'user-id-123',
    description: 'User ID cần gán quyền',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'ADMIN',
    description: 'Group / Role ID',
  })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}
