import { User } from '../../domain/entities/user.entity';

export class UserResponseDto {
  static fromDomain(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      status: user.status,
      createdTime: user.createdTime,
      modifiedTime: user.modifiedTime,
    };
  }

  id: string;
  username: string;
  email?: string | null;
  fullName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  status: string;
  createdTime: Date;
  modifiedTime?: Date;
}
