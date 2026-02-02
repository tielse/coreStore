export class AuthUser {
  constructor(
    public readonly id: string,
    public readonly externalId: string,
    public readonly username: string,
    public readonly email?: string,
    public readonly fullName?: string,
    public readonly phone?: string,
    public readonly avatarUrl?: string,
    public readonly status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' = 'ACTIVE',
    public readonly groups: string[] = [],
  ) {}

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }
}
