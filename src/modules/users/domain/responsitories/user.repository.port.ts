import { User } from '../../domain/entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserListFilter {
  keyword?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  groupId?: string;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export interface UserRepositoryPort {
  // ========= QUERY =========
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByKeycloakId(keycloakUserId: string): Promise<User | null>;

  list(
    filter: UserListFilter,
    pagination: Pagination,
  ): Promise<PaginatedResult<User>>;

  // ========= COMMAND =========
  create(user: User): Promise<User>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
