import { UserRepositoryPort } from '../ports/user-repository.port';
import {
  ApplicationError,
  ErrorCode,
} from '../../../../shared/error/index.error';

export class DeleteUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new ApplicationError(ErrorCode.USER_NOT_FOUND, 'User not found');
    }

    await this.userRepo.delete(userId);
  }
}
