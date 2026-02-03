/**
 * Port: Kafka Event Publisher
 * Định nghĩa contract cho Kafka integration
 */

export interface IKafkaPort {
  /**
   * Publish login event
   */
  publishLoginEvent(data: {
    userId: string;
    email: string;
    keycloakId: string;
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
  }): Promise<void>;

  /**
   * Publish logout event
   */
  publishLogoutEvent(data: {
    userId: string;
    sessionId: string;
    timestamp: Date;
  }): Promise<void>;

  /**
   * Publish user created event
   */
  publishUserCreatedEvent(data: {
    userId: string;
    email: string;
    keycloakId: string;
    username: string;
    timestamp: Date;
  }): Promise<void>;

  /**
   * Publish user updated event
   */
  publishUserUpdatedEvent(data: {
    userId: string;
    changes: Record<string, any>;
    timestamp: Date;
  }): Promise<void>;

  /**
   * Publish generic auth event
   */
  publishAuthEvent(topic: string, data: any): Promise<void>;
}

export const KAFKA_PORT = Symbol('KAFKA_PORT');
