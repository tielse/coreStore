
import type { UserRepositoryPort } from '../ports/user-repository.port';
import type { GroupRepositoryPort } from '../ports/group-repository.port';
import {
  ApplicationError,
  ErrorCode,
} from '../../../../shared/error/index.error';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/responsitories/user.repository.port';
import { GROUP_REPOSITORY } from '../../domain/responsitories/group.repository.port';

export class AssignGroupUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,

    @Inject(GROUP_REPOSITORY)
    private readonly groupRepo: GroupRepositoryPort,
  ) {}

  async execute(
    userId: string,
    groupId: string,
    modifiedBy: string,
  ): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new ApplicationError(ErrorCode.USER_NOT_FOUND, 'User not found');
    }

    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new ApplicationError(ErrorCode.GROUP_NOT_FOUND, 'Group not found');
    }

    if (user.groupIds.includes(groupId)) {
      throw new ApplicationError(
        ErrorCode.USER_ALREADY_IN_GROUP,
        'User already in group',
      );
    }

    // 👉 Business logic nằm trong entity
    user.assignGroup(groupId, modifiedBy);

    // 👉 Persist aggregate
    await this.userRepo.save(user);
  }
}
