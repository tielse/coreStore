import { User } from '../../domain/entities/user.entity';

export interface ListUsersFilter {
  groupId?: string;
  status?: string;
  keyword?: string;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

/**
 * UserRepositoryPort
 * ------------------------------------
 * - Application layer chỉ biết interface này
 * - KHÔNG biết Prisma / SQL / Mongo
 */

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByKeycloakId(keycloakUserId: string): Promise<User | null>;

  list(
    filter: ListUsersFilter,
    pagination: Pagination,
  ): Promise<PaginatedResult<User>>;

  create(user: User): Promise<User>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
