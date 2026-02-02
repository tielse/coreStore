import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { KafkaAuthEventPublisher } from 'src/modules/auth/infrastructure/event/kafka-auth-event.publisher';

@Module({
  providers: [
    KafkaService,
    KafkaAuthEventPublisher,
  ],
  exports: [
    KafkaAuthEventPublisher, // 👈 AuthModule cần cái này
  ],
})
export class KafkaModule {}
