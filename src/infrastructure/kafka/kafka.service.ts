import { Injectable, Logger } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, logLevel } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
  private kafka: Kafka;
  private producer: Producer;
  private readonly logger = new Logger(KafkaService.name);

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'store-platform',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      logLevel: logLevel.ERROR,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.producer = this.kafka.producer();
    await this.producer.connect();
    this.logger.log('✅ Kafka Producer connected');
  }

  async publishEvent<T extends Record<string, any>>(
    topic: string,
    key: string,
    value: T,
  ) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key,
            value: JSON.stringify(value),
            timestamp: Date.now().toString(),
          },
        ],
      });
      this.logger.log(`📤 Event published to ${topic}: ${key}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`❌ Failed to publish event: ${err.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.log('Kafka Producer disconnected');
  }
}
