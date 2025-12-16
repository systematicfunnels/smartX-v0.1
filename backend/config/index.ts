import { config } from 'dotenv';

config();

export const backendConfig = {
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/smartx',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
    ssl: process.env.DB_SSL === 'true',
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    prefix: process.env.REDIS_PREFIX || 'smartx:',
  },

  // MinIO configuration
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost:9000',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucketName: process.env.MINIO_BUCKET || 'smartx-uploads',
    useSSL: process.env.MINIO_USE_SSL === 'true',
  },

  // API configuration
  api: {
    port: parseInt(process.env.API_PORT || '3000'),
    host: process.env.API_HOST || 'localhost',
    rateLimit: parseInt(process.env.API_RATE_LIMIT || '100'),
  },

  // Worker configuration
  workers: {
    maxConcurrency: parseInt(process.env.WORKER_MAX_CONCURRENCY || '5'),
    timeout: parseInt(process.env.WORKER_TIMEOUT || '300000'), // 5 minutes
  },

  // LLM configuration
  llm: {
    provider: process.env.LLM_PROVIDER || 'openai',
    apiKey: process.env.LLM_API_KEY,
    model: process.env.LLM_MODEL || 'gpt-4-turbo',
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
  },

  // Authentication configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    sessionExpiry: process.env.JWT_EXPIRY || '24h',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  },
};

export type BackendConfig = typeof backendConfig;
