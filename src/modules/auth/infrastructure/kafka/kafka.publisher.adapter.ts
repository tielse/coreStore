/**
 * Kafka Publisher Adapter (Infrastructure layer)
 * Implements IKafkaPort
 * Trách nhiệm: publish events tới Kafka
 */

import { Injectable, Logger } from '@nestjs/common';
import { KafkaService } from 'src/shared/infrastructure/kafka/kafka.service';
import { IKafkaPort } from '../../application/ports/kafka.port';

@Injectable()
export class KafkaPublisherAdapter implements IKafkaPort {
  private readonly logger = new Logger(KafkaPublisherAdapter.name);
  private readonly TOPIC_AUTH_EVENTS = 'auth.events';

  constructor(private kafkaService: KafkaService) {}

  /**
   * Publish login event
   */
  async publishLoginEvent(data: {
    userId: string;
    email: string;
    keycloakId: string;
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
  }): Promise<void> {
    try {
      await this.kafkaService.publishEvent(
        this.TOPIC_AUTH_EVENTS,
        `user:${data.userId}`,
        {
          eventType: 'auth.login',
          userId: data.userId,
          email: data.email,
          keycloakId: data.keycloakId,
          sessionId: data.sessionId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          timestamp: data.timestamp.toISOString(),
        },
      );
      this.logger.log(`Login event published for user: ${data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to publish login event: ${error.message}`);
      // Don't throw - event publishing should not break main flow
    }
  }

  /**
   * Publish logout event
   */
  async publishLogoutEvent(data: {
    userId: string;
    sessionId: string;
    timestamp: Date;
  }): Promise<void> {
    try {
      await this.kafkaService.publishEvent(
        this.TOPIC_AUTH_EVENTS,
        `user:${data.userId}`,
        {
          eventType: 'auth.logout',
          userId: data.userId,
          sessionId: data.sessionId,
          timestamp: data.timestamp.toISOString(),
        },
      );
      this.logger.log(`Logout event published for user: ${data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to publish logout event: ${error.message}`);
    }
  }

  /**
   * Publish user created event
   */
  async publishUserCreatedEvent(data: {
    userId: string;
    email: string;
    keycloakId: string;
    username: string;
    timestamp: Date;
  }): Promise<void> {
    try {
      await this.kafkaService.publishEvent(
        this.TOPIC_AUTH_EVENTS,
        `user:${data.userId}`,
        {
          eventType: 'user.created',
          userId: data.userId,
          email: data.email,
          keycloakId: data.keycloakId,
          username: data.username,
          timestamp: data.timestamp.toISOString(),
        },
      );
      this.logger.log(`User created event published: ${data.userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish user created event: ${error.message}`,
      );
    }
  }

  /**
   * Publish user updated event
   */
  async publishUserUpdatedEvent(data: {
    userId: string;
    changes: Record<string, any>;
    timestamp: Date;
  }): Promise<void> {
    try {
      await this.kafkaService.publishEvent(
        this.TOPIC_AUTH_EVENTS,
        `user:${data.userId}`,
        {
          eventType: 'user.updated',
          userId: data.userId,
          changes: data.changes,
          timestamp: data.timestamp.toISOString(),
        },
      );
      this.logger.log(`User updated event published: ${data.userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish user updated event: ${error.message}`,
      );
    }
  }

  /**
   * Publish generic auth event
   */
  async publishAuthEvent(topic: string, data: any): Promise<void> {
    try {
      await this.kafkaService.publishEvent(topic, 'auth-event', {
        ...data,
        timestamp: new Date().toISOString(),
      });
      this.logger.log(`Auth event published to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish auth event: ${error.message}`);
    }
  }
}
