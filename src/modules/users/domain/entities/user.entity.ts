/**
 * User Aggregate Root
 */
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

  activate(modifiedBy: string): User {
    return new User(
      this.id,
      this.keycloakUserId,
      this.username,
      this.email,
      this.fullName,
      this.phone,
      this.avatarUrl,
      'ACTIVE',
      this.groupIds,
      this.createdBy,
      this.createdTime,
      modifiedBy,
      new Date(),
    );
  }

  updateProfile(params: {
    username?: string;
    email?: string | null;
    fullName?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    modifiedBy: string;
  }): User {
    return new User(
      this.id,
      this.keycloakUserId,
      params.username ?? this.username,
      params.email ?? this.email,
      params.fullName ?? this.fullName,
      params.phone ?? this.phone,
      params.avatarUrl ?? this.avatarUrl,
      this.status,
      this.groupIds,
      this.createdBy,
      this.createdTime,
      params.modifiedBy,
      new Date(),
    );
  }

  block(modifiedBy: string): User {
    return new User(
      this.id,
      this.keycloakUserId,
      this.username,
      this.email,
      this.fullName,
      this.phone,
      this.avatarUrl,
      'BLOCKED',
      this.groupIds,
      this.createdBy,
      this.createdTime,
      modifiedBy,
      new Date(),
    );
  }

  assignGroup(groupId: string, actorId: string): User {
    if (this.groupIds.includes(groupId)) {
      return this;
    }

    return new User(
      this.id,
      this.keycloakUserId,
      this.username,
      this.email,
      this.fullName,
      this.phone,
      this.avatarUrl,
      this.status,
      [...this.groupIds, groupId],
      this.createdBy,
      this.createdTime,
      actorId,
      new Date(),
    );
  }
}
