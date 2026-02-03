import { IsString, IsNotEmpty, IsOptional, IsIP } from 'class-validator';

export class LoginRequestDTO {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
