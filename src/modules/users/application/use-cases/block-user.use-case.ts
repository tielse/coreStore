import { UserRepositoryPort } from '../ports/user-repository.port';
import {
  ApplicationError,
  ErrorCode,
} from '../../../../shared/error/index.error';

export class BlockUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(userId: string, modifiedBy: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new ApplicationError(ErrorCode.USER_NOT_FOUND, 'User not found');
    }

    const blockedUser = user.block(modifiedBy);
    await this.userRepo.save(blockedUser);
  }
}
