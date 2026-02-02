import { UserRepositoryPort } from '../ports/user-repository.port';
import { ListUsersDto } from '../dto/list-users.dto';

export class ListUsersUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(query: ListUsersDto) {
    return this.userRepo.list(
      {
        groupId: query.groupId,
        status: query.status,
        keyword: query.keyword,
      },
      {
        page: query.page,
        limit: query.limit,
      },
    );
  }
}
