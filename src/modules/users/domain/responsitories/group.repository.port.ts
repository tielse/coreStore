export const GROUP_REPOSITORY = Symbol('GROUP_REPOSITORY');

export interface GroupRepositoryPort {
  findById(id: string): Promise<{
    id: string;
    name: string;
  } | null>;
}
