import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RefreshTokenRequestDTO {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}
