import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../src/modules/prisma/prisma.service';
import { GroupRepositoryPort } from '../../application/ports/group-repository.port';
import { Group } from '../../domain/entities/group.entity';

@Injectable()
export class GroupPrismaRepository implements GroupRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  // =====================================
  // Mapping: Prisma → Domain Entity
  // =====================================
  private toEntity(group: any): Group {
    return new Group(
      group.id,
      group.name,
      group.description ?? null,
      group.status,
      group.created_by,
      group.created_time,
      group.modified_by ?? null,
      group.modified_time ?? undefined,
    );
  }

  // =====================================
  // Queries
  // =====================================
  async findById(id: string): Promise<Group | null> {
    const group = await this.prisma.sys_group.findUnique({
      where: { id },
    });

    return group ? this.toEntity(group) : null;
  }

  async findAll(): Promise<Group[]> {
    const groups = await this.prisma.sys_group.findMany({
      orderBy: { created_time: 'asc' },
    });

    return groups.map((g) => this.toEntity(g));
  }

  // =====================================
  // Commands
  // =====================================
  async save(group: Group): Promise<Group> {
    const saved = await this.prisma.sys_group.upsert({
      where: { id: group.id },
      update: {
        name: group.name,
        description: group.description,
        status: group.status,
        modified_by: group.modifiedBy,
        modified_time: group.modifiedTime,
      },
      create: {
        id: group.id,
        name: group.name,
        description: group.description,
        status: group.status,
        created_by: group.createdBy,
        created_time: group.createdTime,
      },
    });

    return this.toEntity(saved);
  }
}
