import { Injectable } from '@nestjs/common';
import { KafkaService } from 'src/shared/infrastructure/kafka/kafka.service';
import { AuthEvent } from '../../application/events/auth-token.event';

@Injectable()
export class KafkaAuthEventPublisher {
  constructor(private readonly kafka: KafkaService) {}

  async publish(event: AuthEvent): Promise<void> {
    await this.kafka.publishEvent('auth-events', event.userId, event);
  }
}
