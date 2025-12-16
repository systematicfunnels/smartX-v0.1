import { Queue, Worker, QueueEvents } from 'bullmq';
import { backendConfig } from '../../config';
import Redis from 'ioredis';

export class QueueService {
  private connection: Redis;
  private queues: Map<string, Queue>;
  private workers: Map<string, Worker>;
  private queueEvents: Map<string, QueueEvents>;

  constructor() {
    this.connection = new Redis(backendConfig.redis.url);
    this.queues = new Map();
    this.workers = new Map();
    this.queueEvents = new Map();
  }

  async getQueue(queueName: string): Promise<Queue> {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, {
        connection: this.connection,
        prefix: backendConfig.redis.prefix,
      });
      this.queues.set(queueName, queue);
    }
    return this.queues.get(queueName)!;
  }

  async addJob(queueName: string, jobName: string, data: any, options: any = {}): Promise<void> {
    const queue = await this.getQueue(queueName);
    await queue.add(jobName, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      ...options,
    });
  }

  async createWorker(
    queueName: string,
    processor: (job: any) => Promise<any>,
    concurrency: number = backendConfig.workers.maxConcurrency
  ): Promise<Worker> {
    const worker = new Worker(queueName, processor, {
      connection: this.connection,
      prefix: backendConfig.redis.prefix,
      concurrency,
    });

    this.workers.set(queueName, worker);
    return worker;
  }

  async getQueueEvents(queueName: string): Promise<QueueEvents> {
    if (!this.queueEvents.has(queueName)) {
      const events = new QueueEvents(queueName, {
        connection: this.connection,
        prefix: backendConfig.redis.prefix,
      });
      this.queueEvents.set(queueName, events);
    }
    return this.queueEvents.get(queueName)!;
  }

  async close(): Promise<void> {
    await this.connection.quit();
  }
}

// Singleton instance
export const queueService = new QueueService();
