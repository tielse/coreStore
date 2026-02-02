import { UserRepositoryPort } from '../ports/user-repository.port';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  ApplicationError,
  ErrorCode,
} from '../../../../shared/error/index.error';
import { User } from '../../domain/entities/user.entity';

export class UpdateUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(
    userId: string,
    dto: UpdateUserDto,
    modifiedBy: string,
  ): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new ApplicationError(ErrorCode.USER_NOT_FOUND, 'User not found');
    }

    const updatedUser = user.updateProfile({
      username: dto.username,
      email: dto.email ?? null,
      fullName: dto.fullName ?? null,
      phone: dto.phone ?? null,
      avatarUrl: dto.avatarUrl ?? null,
      modifiedBy: modifiedBy,
    });

    return this.userRepo.save(updatedUser);
  }
}
