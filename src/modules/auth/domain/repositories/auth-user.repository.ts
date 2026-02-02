import { AuthUser } from '../entities/auth-user.entity';

/**
 * AuthUserRepository
 *
 * Aggregate Root: AuthUser
 * Backed by: sys_user + sys_user_group + sys_group
 */
export interface AuthUserRepository {
  /**
   * Find user by internal user id
   */
  findById(userId: string): Promise<AuthUser | null>;

  /**
   * Find user by Keycloak user id
   */
  findByExternalId(externalId: string): Promise<AuthUser | null>;

  /**
   * Create or update local user from Identity Provider
   *
   * Use case:
   * - First login
   * - User info changed in Keycloak
   */
  upsertFromIdentity(identity: {
    externalId: string;
    username: string;
    email?: string;
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
    groups: string[];
    status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  }): Promise<AuthUser>;

  /**
   * Update user status (BLOCK / INACTIVE)
   * Used by admin / sync job
   */
  updateStatus(
    userId: string,
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED',
  ): Promise<void>;

  /**
   * Load user with groups (roles)
   */
  findWithGroups(userId: string): Promise<AuthUser | null>;
}
