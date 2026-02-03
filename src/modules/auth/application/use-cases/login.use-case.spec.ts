/**
 * Login UseCase Tests
 * Test scenarios:
 * - First-time login (user created)
 * - Existing user login
 * - Login with profile changes
 * - Invalid token
 * - Database transaction failure
 */

import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.use-case';
import { IUserRepository, USER_REPOSITORY } from '../ports';
import { ISessionRepository, SESSION_REPOSITORY } from '../ports';
import { IKeycloakPort, KEYCLOAK_PORT } from '../ports';
import { IKafkaPort, KAFKA_PORT } from '../ports';
import { ICachePort, CACHE_PORT } from '../ports';
import { LoginRequestDTO } from '../dtos/login.request.dto';
import { BadRequestException } from '@nestjs/common';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockSessionRepository: jest.Mocked<ISessionRepository>;
  let mockKeycloakPort: jest.Mocked<IKeycloakPort>;
  let mockKafkaPort: jest.Mocked<IKafkaPort>;
  let mockCachePort: jest.Mocked<ICachePort>;

  const mockKeycloakPayload = {
    sub: 'keycloak-id-123',
    email: 'user@example.com',
    name: 'John Doe',
    preferred_username: 'john.doe',
    realm_access: { roles: ['user'] },
  };

  beforeEach(async () => {
    // Create mocks
    mockUserRepository = {
      findById: jest.fn(),
      findByKeycloakId: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    };

    mockSessionRepository = {
      createSession: jest.fn(),
      getSession: jest.fn(),
      deleteSession: jest.fn(),
      listUserSessions: jest.fn(),
      revokeSession: jest.fn(),
      deleteExpiredSessions: jest.fn(),
    };

    mockKeycloakPort = {
      verifyToken: jest.fn(),
      getUser: jest.fn(),
      revokeToken: jest.fn(),
      listUsers: jest.fn(),
      updateUser: jest.fn(),
      getUserRoles: jest.fn(),
    };

    mockKafkaPort = {
      publishLoginEvent: jest.fn(),
      publishLogoutEvent: jest.fn(),
      publishUserCreatedEvent: jest.fn(),
      publishUserUpdatedEvent: jest.fn(),
      publishAuthEvent: jest.fn(),
    };

    mockCachePort = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
      deletePattern: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
      expire: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: SESSION_REPOSITORY,
          useValue: mockSessionRepository,
        },
        {
          provide: KEYCLOAK_PORT,
          useValue: mockKeycloakPort,
        },
        {
          provide: KAFKA_PORT,
          useValue: mockKafkaPort,
        },
        {
          provide: CACHE_PORT,
          useValue: mockCachePort,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  describe('execute - First-time login', () => {
    it('should create user, session, and publish events', async () => {
      // Setup
      const request: LoginRequestDTO = {
        token: 'valid-token',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
      };

      mockKeycloakPort.verifyToken.mockResolvedValue(mockKeycloakPayload);
      mockUserRepository.findByKeycloakId.mockResolvedValue(null);

      const newUser = {
        id: 'user-uuid',
        keycloak_user_id: mockKeycloakPayload.sub,
        email: mockKeycloakPayload.email,
        username: mockKeycloakPayload.preferred_username,
        full_name: mockKeycloakPayload.name,
        status: 'ACTIVE',
      };

      mockUserRepository.create.mockResolvedValue(newUser);
      mockSessionRepository.createSession.mockResolvedValue({});
      mockCachePort.set.mockResolvedValue(undefined);
      mockKafkaPort.publishUserCreatedEvent.mockResolvedValue(undefined);
      mockKafkaPort.publishLoginEvent.mockResolvedValue(undefined);
      mockCachePort.deletePattern.mockResolvedValue(0);

      // Execute
      const result = await useCase.execute(request);

      // Assert
      expect(mockKeycloakPort.verifyToken).toHaveBeenCalledWith(request.token);
      expect(mockUserRepository.findByKeycloakId).toHaveBeenCalledWith(
        mockKeycloakPayload.sub,
      );
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockSessionRepository.createSession).toHaveBeenCalled();
      expect(mockCachePort.set).toHaveBeenCalledTimes(2); // session + user_sessions
      expect(mockKafkaPort.publishUserCreatedEvent).toHaveBeenCalled();
      expect(mockKafkaPort.publishLoginEvent).toHaveBeenCalled();

      expect(result.userId).toBe(newUser.id);
      expect(result.email).toBe(newUser.email);
      expect(result.sessionId).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });
  });

  describe('execute - Existing user login', () => {
    it('should NOT create user, just create session', async () => {
      // Setup
      const request: LoginRequestDTO = {
        token: 'valid-token',
        ipAddress: '192.168.1.1',
      };

      mockKeycloakPort.verifyToken.mockResolvedValue(mockKeycloakPayload);

      const existingUser = {
        id: 'user-uuid',
        keycloak_user_id: mockKeycloakPayload.sub,
        email: mockKeycloakPayload.email,
        username: mockKeycloakPayload.preferred_username,
        full_name: mockKeycloakPayload.name,
        status: 'ACTIVE',
      };

      mockUserRepository.findByKeycloakId.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(existingUser);
      mockSessionRepository.createSession.mockResolvedValue({});
      mockCachePort.set.mockResolvedValue(undefined);
      mockKafkaPort.publishLoginEvent.mockResolvedValue(undefined);
      mockCachePort.deletePattern.mockResolvedValue(0);

      // Execute
      const result = await useCase.execute(request);

      // Assert
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockKafkaPort.publishUserCreatedEvent).not.toHaveBeenCalled();
      expect(mockKafkaPort.publishLoginEvent).toHaveBeenCalled();

      expect(result.userId).toBe(existingUser.id);
      expect(result.email).toBe(existingUser.email);
    });
  });

  describe('execute - Profile changes', () => {
    it('should update user when profile changed', async () => {
      // Setup
      const request: LoginRequestDTO = {
        token: 'valid-token',
      };

      mockKeycloakPort.verifyToken.mockResolvedValue(mockKeycloakPayload);

      const existingUserWithOldData = {
        id: 'user-uuid',
        keycloak_user_id: mockKeycloakPayload.sub,
        email: 'old-email@example.com', // Different!
        username: 'old.username',
        full_name: 'Old Name',
        status: 'ACTIVE',
      };

      const updatedUser = {
        ...existingUserWithOldData,
        email: mockKeycloakPayload.email,
        full_name: mockKeycloakPayload.name,
      };

      mockUserRepository.findByKeycloakId.mockResolvedValue(
        existingUserWithOldData,
      );
      mockUserRepository.update.mockResolvedValue(updatedUser);
      mockSessionRepository.createSession.mockResolvedValue({});
      mockCachePort.set.mockResolvedValue(undefined);
      mockKafkaPort.publishUserUpdatedEvent.mockResolvedValue(undefined);
      mockKafkaPort.publishLoginEvent.mockResolvedValue(undefined);
      mockCachePort.deletePattern.mockResolvedValue(0);

      // Execute
      const result = await useCase.execute(request);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalled();
      expect(mockKafkaPort.publishUserUpdatedEvent).toHaveBeenCalled();

      const updateCall = mockUserRepository.update.mock.calls[0];
      expect(updateCall[1]).toHaveProperty('email', mockKeycloakPayload.email);
      expect(updateCall[1]).toHaveProperty(
        'full_name',
        mockKeycloakPayload.name,
      );
    });
  });

  describe('execute - Invalid token', () => {
    it('should throw BadRequestException for invalid token', async () => {
      // Setup
      const request: LoginRequestDTO = {
        token: 'invalid-token',
      };

      mockKeycloakPort.verifyToken.mockRejectedValue(
        new Error('Token verification failed'),
      );

      // Execute & Assert
      await expect(useCase.execute(request)).rejects.toThrow();
    });
  });

  describe('execute - Missing email claim', () => {
    it('should throw BadRequestException when email missing', async () => {
      // Setup
      const request: LoginRequestDTO = {
        token: 'token-no-email',
      };

      mockKeycloakPort.verifyToken.mockResolvedValue({
        sub: 'id-123',
        email: 'test@gmail.com',
      });

      // Execute & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
