import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../src/modules/prisma/prisma.service';

import {
  UserRepositoryPort,
  ListUsersFilter,
  Pagination,
  PaginatedResult,
} from '../../application/ports/user-repository.port';

import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UserPrismaRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  // ======================================================
  // Mapping: Prisma → Domain Entity
  // ======================================================
  private toEntity(user: any): User {
    return new User(
      user.id,
      user.keycloak_user_id,
      user.username,
      user.email ?? null,
      user.full_name ?? null,
      user.phone ?? null,
      user.avatar_url ?? null,
      user.status,
      user.groups?.map((g: any) => g.group_id) ?? [],
      user.created_by,
      user.created_time,
      user.modified_by ?? null,
      user.modified_time ?? undefined,
    );
  }

  // ======================================================
  // Queries
  // ======================================================
  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.sys_user.findUnique({
      where: { id },
      include: { groups: true },
    });

    return user ? this.toEntity(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.sys_user.findFirst({
      where: { username },
      include: { groups: true },
    });

    return user ? this.toEntity(user) : null;
  }

  async findByKeycloakId(keycloakUserId: string): Promise<User | null> {
    const user = await this.prisma.sys_user.findUnique({
      where: { keycloak_user_id: keycloakUserId },
      include: { groups: true },
    });

    return user ? this.toEntity(user) : null;
  }

  async list(
    filter: ListUsersFilter,
    pagination: Pagination,
  ): Promise<PaginatedResult<User>> {
    const where: any = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.groupId) {
      where.groups = {
        some: { group_id: filter.groupId },
      };
    }

    if (filter.keyword) {
      where.OR = [
        { username: { contains: filter.keyword, mode: 'insensitive' } },
        { email: { contains: filter.keyword, mode: 'insensitive' } },
        { full_name: { contains: filter.keyword, mode: 'insensitive' } },
      ];
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;

    const [users, total] = await Promise.all([
      this.prisma.sys_user.findMany({
        where,
        include: { groups: true },
        skip,
        take,
        orderBy: { created_time: 'desc' },
      }),
      this.prisma.sys_user.count({ where }),
    ]);

    return {
      items: users.map((u) => this.toEntity(u)),
      total,
    };
  }

  // ======================================================
  // Commands
  // ======================================================
  async create(user: User): Promise<User> {
    const created = await this.prisma.sys_user.create({
      data: {
        id: user.id,
        keycloak_user_id: user.keycloakUserId,
        username: user.username,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        avatar_url: user.avatarUrl,
        status: user.status,
        created_by: user.createdBy,

        groups: {
          create: user.groupIds.map((groupId) => ({
            group_id: groupId,
            created_by: user.createdBy,
          })),
        },
      },
      include: { groups: true },
    });

    return this.toEntity(created);
  }

  async save(user: User): Promise<User> {
    const updated = await this.prisma.sys_user.update({
      where: { id: user.id },
      data: {
        username: user.username,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        avatar_url: user.avatarUrl,
        status: user.status,
        modified_by: user.modifiedBy,

        // replace groups atomically
        groups: {
          deleteMany: {},
          create: user.groupIds.map((groupId) => ({
            group_id: groupId,
            created_by: user.modifiedBy ?? user.createdBy,
          })),
        },
      },
      include: { groups: true },
    });

    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.sys_user.update({
      where: { id },
      data: {
        status: 'INACTIVE',
      },
    });
  }
}
