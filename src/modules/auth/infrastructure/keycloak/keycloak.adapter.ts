/**
 * Keycloak Adapter (Infrastructure layer)
 * Implements IKeycloakPort
 * Trách nhiệm: giao tiếp với Keycloak server
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import axios, { AxiosInstance } from 'axios';
import { IKeycloakPort } from '../../application/ports/keycloak.port';
import jwkToPem from 'jwk-to-pem';

@Injectable()
export class KeycloakAdapter implements IKeycloakPort {
  private readonly logger = new Logger(KeycloakAdapter.name);
  private readonly adminClient: AxiosInstance;
  private keycloakUrl: string;
  private clientId: string;
  private clientSecret: string;
  private adminUsername: string;
  private adminPassword: string;
  private realm: string;

  constructor(private configService: ConfigService) {
    this.keycloakUrl = this.configService.get<string>(
      'KEYCLOAK_URL',
      'http://localhost:8080',
    );
    this.clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID', '');
    this.clientSecret = this.configService.get<string>(
      'KEYCLOAK_CLIENT_SECRET',
      '',
    );
    this.adminUsername = this.configService.get<string>(
      'KEYCLOAK_ADMIN_USER',
      'admin',
    );
    this.adminPassword = this.configService.get<string>(
      'KEYCLOAK_ADMIN_PASSWORD',
      'admin',
    );
    this.realm = this.configService.get<string>('KEYCLOAK_REALM', 'master');

    this.adminClient = axios.create({
      baseURL: `${this.keycloakUrl}/admin/realms/${this.realm}`,
      timeout: 5000,
    });
  }

  /**
   * Verify access token
   * TODO: cache JWKS keys để tối ưu performance
   */
  async verifyToken(token: string): Promise<any> {
  try {
    const jwksUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/certs`;
    const { data } = await axios.get(jwksUrl);

    const decodedHeader = jwt.decode(token, { complete: true }) as any;
    if (!decodedHeader?.header?.kid) {
      throw new Error('Invalid token header');
    }

    const jwk = data.keys.find(
      (k: any) => k.kid === decodedHeader.header.kid,
    );

    if (!jwk) {
      throw new Error('Public key not found');
    }

    const publicKey = jwkToPem(jwk);

    return jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: `${this.keycloakUrl}/realms/${this.realm}`,
    });
  } catch (error) {
    this.logger.error(`Token verification failed: ${error.message}`);
    throw new Error('Invalid token');
  }
}


  /**
   * Get user from Keycloak
   */
  async getUser(identifier: { sub?: string; email?: string }): Promise<any> {
    try {
      const token = await this.getAdminToken();

      let users: any[] = [];
      if (identifier.email) {
        users = await this.adminClient
          .get('/users', {
            params: { email: identifier.email },
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((r) => r.data);
      } else if (identifier.sub) {
        const user = await this.adminClient
          .get(`/users/${identifier.sub}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((r) => r.data);
        users = [user];
      }

      return users[0] || null;
    } catch (error) {
      this.logger.error(`Get user failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Revoke token
   */
  async revokeToken(
    token: string,
    type: 'access' | 'refresh' = 'access',
  ): Promise<void> {
    try {
      const tokenEndpoint = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/revoke`;
      await axios.post(tokenEndpoint, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        token: token,
        token_type_hint: type === 'refresh' ? 'refresh_token' : 'access_token',
      });
      this.logger.log(`Token revoked successfully`);
    } catch (error) {
      this.logger.error(`Token revocation failed: ${error.message}`);
      // Don't throw - silently fail for revocation attempts
    }
  }

  /**
   * List users from Keycloak
   */
  async listUsers(params?: {
    first?: number;
    max?: number;
    search?: string;
  }): Promise<any[]> {
    try {
      const token = await this.getAdminToken();
      const response = await this.adminClient.get('/users', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`List users failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Update user in Keycloak
   */
  async updateUser(userId: string, updates: any): Promise<void> {
    try {
      const token = await this.getAdminToken();
      await this.adminClient.put(`/users/${userId}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.logger.log(`User ${userId} updated in Keycloak`);
    } catch (error) {
      this.logger.error(`Update user failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<string[]> {
    try {
      const token = await this.getAdminToken();
      const response = await this.adminClient.get(
        `/users/${userId}/role-mappings/realm`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.map((role: any) => role.name);
    } catch (error) {
      this.logger.error(`Get user roles failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Helper: Get admin token
   */
  private async getAdminToken(): Promise<string> {
    try {
      const tokenEndpoint = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;
      const response = await axios.post(tokenEndpoint, {
        grant_type: 'password',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username: this.adminUsername,
        password: this.adminPassword,
        scope: 'openid',
      });
      return response.data.access_token;
    } catch (error) {
      this.logger.error(`Failed to get admin token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper: Convert JWK to public key
   */
  private convertJwkToPublicKey(jwk: any): string {
    // Implementation depends on your specific JWT library
    // For now, return a placeholder
    return '';
  }
}
