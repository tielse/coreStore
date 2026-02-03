import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LogoutRequestDTO {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}
