import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = createClient({
      url: redisUrl
    });

    redisClient.on('error', (error: unknown) => {
      console.error('Redis error:', error);
    });

    await redisClient.connect();
    console.log('✅ Connected to Redis');
  }

  return redisClient;
}

export const redisConnection = {
  host: process.env.REDIS_URL || 'localhost',
  port: 6379
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (redisClient) {
    await redisClient.quit();
    console.log('🔌 Redis connection closed');
  }
  process.exit(0);
});
