/**
 * User Prisma Repository (Infrastructure layer)
 * Implements IUserRepository
 * Trách nhiệm: giao tiếp với Prisma để persist user data
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { IUserRepository } from '../../application/ports/user.repository.port';

@Injectable()
export class UserPrismaRepository implements IUserRepository {
  private readonly logger = new Logger(UserPrismaRepository.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<any> {
    try {
      return await this.prisma.sys_user.findUnique({
        where: { id },
        include: { groups: true, sessions: true },
      });
    } catch (error) {
      this.logger.error(`Find user by ID failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find user by Keycloak ID
   */
  async findByKeycloakId(keycloakId: string): Promise<any> {
    try {
      return await this.prisma.sys_user.findUnique({
        where: { keycloak_user_id: keycloakId },
        include: { groups: true, sessions: true },
      });
    } catch (error) {
      this.logger.error(`Find user by Keycloak ID failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<any> {
    try {
      return await this.prisma.sys_user.findFirst({
        where: { email },
        include: { groups: true, sessions: true },
      });
    } catch (error) {
      this.logger.error(`Find user by email failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create new user
   */
  async create(user: {
    id: string;
    keycloak_user_id: string;
    username: string;
    email?: string;
    full_name?: string;
    phone?: string;
    avatar_url?: string;
    status?: string;
    created_by: string;
  }): Promise<any> {
    try {
      return await this.prisma.sys_user.create({
        data: {
          id: user.id,
          keycloak_user_id: user.keycloak_user_id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          avatar_url: user.avatar_url,
          status: user.status || 'ACTIVE',
          created_by: user.created_by,
        },
        include: { groups: true, sessions: true },
      });
    } catch (error) {
      this.logger.error(`Create user failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user
   */
  async update(
    id: string,
    updates: Partial<{
      username: string;
      email: string;
      full_name: string;
      phone: string;
      avatar_url: string;
      status: string;
      modified_by: string;
    }>,
  ): Promise<any> {
    try {
      return await this.prisma.sys_user.update({
        where: { id },
        data: {
          ...updates,
          modified_by: updates.modified_by || 'system',
          modified_time: new Date(),
        },
        include: { groups: true, sessions: true },
      });
    } catch (error) {
      this.logger.error(`Update user failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.sys_user.delete({
        where: { id },
      });
      this.logger.log(`User deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Delete user failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * List users with pagination and filtering
   */
  async list(params?: {
    skip?: number;
    take?: number;
    search?: string;
    status?: string;
  }): Promise<{ data: any[]; total: number }> {
    try {
      const where: any = {};

      if (params?.status) {
        where.status = params.status;
      }

      if (params?.search) {
        where.OR = [
          { username: { contains: params.search, mode: 'insensitive' } },
          { email: { contains: params.search, mode: 'insensitive' } },
          { full_name: { contains: params.search, mode: 'insensitive' } },
        ];
      }

      const [data, total] = await Promise.all([
        this.prisma.sys_user.findMany({
          where,
          skip: params?.skip || 0,
          take: params?.take || 20,
          include: { groups: true },
        }),
        this.prisma.sys_user.count({ where }),
      ]);

      return { data, total };
    } catch (error) {
      this.logger.error(`List users failed: ${error.message}`);
      throw error;
    }
  }
}
