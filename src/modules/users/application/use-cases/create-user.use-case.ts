/**
 * Create User Use Case
 * ✅ SUCCESS 201: CREATE_USER_201
 * ❌ VALIDATION_400
 * ❌ CONFLICT_409
 */
import { UserRepositoryPort } from '../ports/user-repository.port';
import { CreateUserDto } from '../dto/create-user.dto';
import {
  ApplicationError,
  ErrorCode,
} from '../../../../shared/error/index.error';
import { User } from '../../domain/entities/user.entity';
import { randomUUID } from 'crypto';

export class CreateUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(dto: CreateUserDto, createdBy: string): Promise<User> {
    const exists = await this.userRepo.findByUsername(dto.username);
    if (exists) {
      throw new ApplicationError(
        ErrorCode.USER_ALREADY_EXISTS,
        'User already exists',
      );
    }

    const user = new User(
      randomUUID(), // id
      '', // keycloakUserId (sẽ sync sau)
      dto.username,
      dto.email ?? null,
      dto.fullName ?? null,
      dto.phone ?? null,
      dto.avatarUrl ?? null,
      'ACTIVE',
      [], // groupIds
      createdBy,
      new Date(),
    );

    return await this.userRepo.create(user);
  }
}
