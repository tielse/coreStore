import { UserRepositoryPort } from '../ports/user-repository.port';
import {
  ApplicationError,
  ErrorCode,
} from '../../../../shared/error/index.error';
import { User } from '../../domain/entities/user.entity';

export class GetUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new ApplicationError(ErrorCode.USER_NOT_FOUND, 'User not found');
    }
    return user;
  }
}
