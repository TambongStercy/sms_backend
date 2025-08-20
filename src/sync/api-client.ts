import axios, { AxiosInstance } from 'axios';
import { RemoteRecord } from './types';

export class ApiClient {
  private client: AxiosInstance;
  private remoteUrl: string;
  private apiKey: string;

  constructor() {
    this.remoteUrl = process.env.REMOTE_SYNC_URL || 'https://your-vps.com/api/sync';
    this.apiKey = process.env.SYNC_API_KEY || '';
    
    this.client = axios.create({
      baseURL: this.remoteUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Server-ID': process.env.SERVER_ID || 'local'
      },
      timeout: 30000 // 30 seconds
    });
  }

  async getChanges(tableName: string, lastSync: Date): Promise<RemoteRecord[]> {
    try {
      const response = await this.client.get(`/changes/${tableName}`, {
        params: {
          since: lastSync.toISOString(),
          server_id: process.env.SERVER_ID
        }
      });

      return response.data.records || [];
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log('Remote server unavailable - working offline');
        return [];
      }
      throw error;
    }
  }

  async pushRecord(tableName: string, record: any): Promise<void> {
    try {
      await this.client.post(`/records/${tableName}`, {
        record,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      if (error.response?.status === 409) {
        // Conflict - handle appropriately
        console.log(`Conflict detected for ${tableName}[${record.id}]`);
        throw new Error('Conflict detected');
      }
      throw error;
    }
  }

  async pushBatch(tableName: string, records: any[]): Promise<void> {
    const batchSize = 100;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      try {
        await this.client.post(`/batch/${tableName}`, {
          records: batch,
          timestamp: new Date().toISOString()
        });
      } catch (error: any) {
        console.error(`Batch push failed for ${tableName}:`, error.message);
        // Continue with next batch
      }
    }
  }

  async getServerInfo(): Promise<any> {
    try {
      const response = await this.client.get('/info');
      return response.data;
    } catch (error: any) {
      return null;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch (error: any) {
      return false;
    }
  }
}