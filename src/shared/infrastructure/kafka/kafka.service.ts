import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka!: Kafka;
  private producer!: Producer;
  private consumer!: Consumer;

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID ?? 'platform-backend',
      brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
    });

    this.producer = this.kafka.producer();
    await this.producer.connect();

    this.logger.log('✅ Kafka Producer connected');
  }

  /**
   * Publish domain event (Auth, User, Payment...)
   */
  async publishEvent<T>(topic: string, key: string, payload: T): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(payload),
        },
      ],
    });

    this.logger.debug(`📤 Kafka event published → ${topic}`);
  }

  /**
   * Low-level produce (optional)
   */
  async produce<T>(topic: string, message: T, key?: string): Promise<void> {
    await this.publishEvent(topic, key ?? '', message);
  }

  async consume(
    groupId: string,
    topic: string,
    handler: (payload: {
      topic: string;
      message: any;
      key?: string;
    }) => Promise<void>,
  ) {
    this.consumer = this.kafka.consumer({ groupId });

    await this.consumer.connect();
    await this.consumer.subscribe({ topic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const value = message.value
            ? JSON.parse(message.value.toString())
            : null;

          await handler({
            topic,
            message: value,
            key: message.key?.toString(),
          });
        } catch (error) {
          this.logger.error(
            `❌ Kafka consume error: ${(error as Error).message}`,
          );
        }
      },
    });

    this.logger.log(`👂 Kafka Consumer listening → ${topic}`);
  }

  async onModuleDestroy() {
    if (this.consumer) await this.consumer.disconnect();
    if (this.producer) await this.producer.disconnect();
  }
}
