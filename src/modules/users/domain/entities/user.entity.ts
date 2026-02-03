/**
 * User Aggregate Root
 * ------------------
 * - Đại diện user trong hệ thống nội bộ
 * - Đồng bộ từ Identity Provider (Keycloak)
 */

import { now } from '../../../../shared/utils/time.util';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export class User {
  constructor(
    public readonly id: string,
    public readonly keycloakUserId: string,

    public readonly username: string,
    public readonly email: string | null,
    public readonly fullName: string | null,
    public readonly phone: string | null,
    public readonly avatarUrl: string | null,

    public readonly status: UserStatus,
    public readonly groupIds: string[],

    public readonly createdBy: string,
    public readonly createdTime: Date,
    public readonly modifiedBy?: string | null,
    public readonly modifiedTime?: Date,
  ) {}

  // =========================
  // FACTORY
  // =========================
  static createFromIdentity(identity: {
    id: string;
    externalId: string;
    username: string;
    email?: string;
    fullName?: string;
    phone?: string;
    groups?: string[];
    createdBy: string;
  }): User {
    return new User(
      identity.id,
      identity.externalId,
      identity.username,
      identity.email ?? null,
      identity.fullName ?? null,
      identity.phone ?? null,
      null,
      'ACTIVE',
      identity.groups ?? [],
      identity.createdBy || 'SYSTEM',
      now(),
    );
  }

  // =========================
  // SYNC FROM IDP
  // =========================
  syncFromIdentity(identity: {
    username: string;
    email?: string;
    fullName?: string;
    phone?: string;
    groups?: string[];
  }): User {
    return new User(
      this.id,
      this.keycloakUserId,
      identity.username ?? this.username,
      identity.email ?? this.email,
      identity.fullName ?? this.fullName,
      identity.phone ?? this.phone,
      this.avatarUrl,
      this.status,
      identity.groups ?? this.groupIds,
      this.createdBy,
      this.createdTime,
      this.modifiedBy ?? 'SYSTEM',
      now(),
    );
  }

  // =========================
  // BEHAVIOR
  // =========================
  activate(actorId: string): User {
    return this.clone({ status: 'ACTIVE', actorId: actorId });
  }

  block(actorId: string): User {
    return this.clone({ status: 'BLOCKED', actorId: actorId });
  }

  assignGroup(groupId: string, actorId: string): User {
    if (this.groupIds.includes(groupId)) return this;
    return this.clone({ groupIds: [...this.groupIds, groupId, actorId] });
  }

  updateProfile(params: {
    username?: string;
    email?: string | null;
    fullName?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    actorId?: string;
    modifiedBy?: string;
  }): User {
    return this.clone({
      username: params.username ?? this.username,
      email: params.email ?? this.email,
      fullName: params.fullName ?? this.fullName,
      phone: params.phone ?? this.phone,
      avatarUrl: params.avatarUrl ?? this.avatarUrl,
      actorId: params.actorId ?? this.modifiedBy ?? 'SYSTEM',
    });
  }

  // =========================
  // INTERNAL
  // =========================
  private clone(
    changes: Partial<{
      status: UserStatus;
      groupIds: string[];
      username: string;
      email: string | null;
      fullName: string | null;
      phone: string | null;
      avatarUrl: string | null;
      actorId: string;
    }>,
  ): User {
    return new User(
      this.id,
      this.keycloakUserId,
      changes.username ?? this.username,
      changes.email ?? this.email,
      changes.fullName ?? this.fullName,
      changes.phone ?? this.phone,
      changes.avatarUrl ?? this.avatarUrl,
      changes.status ?? this.status,
      changes.groupIds ?? this.groupIds,
      this.createdBy,
      this.createdTime,
      changes.actorId ?? this.modifiedBy ?? 'SYSTEM',
      now(),
    );
  }
}
