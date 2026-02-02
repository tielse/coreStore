import { Group } from '../../domain/entities/group.entity';

export const GROUP_REPOSITORY = Symbol('GROUP_REPOSITORY');

export interface GroupRepositoryPort {
  findById(id: string): Promise<Group | null>;
  findAll(): Promise<Group[]>;
  save(group: Group): Promise<Group>;
}
