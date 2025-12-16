// SmartX API Client
// Type-safe API client for SmartX applications

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class SmartXClient {
  private client: AxiosInstance;
  private tenantId: string;
  private userId: string;

  constructor(baseURL: string, tenantId: string, userId: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-user-id': userId
      }
    });

    this.tenantId = tenantId;
    this.userId = userId;
  }

  // Jobs API
  async createJob(data: any): Promise<AxiosResponse> {
    return this.client.post('/api/jobs', data);
  }

  // Meetings API
  async createMeeting(data: any): Promise<AxiosResponse> {
    return this.client.post('/api/meetings', data);
  }

  // Retention API
  async getRetentionStats(): Promise<AxiosResponse> {
    return this.client.get('/api/retention', {
      params: { tenantId: this.tenantId }
    });
  }

  // Generic request method
  async request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.client(config);
  }
}

export { SmartXClient };
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse };
