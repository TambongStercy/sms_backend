import { ApiClient } from './api-client';

export class NetworkChecker {
  private apiClient: ApiClient;
  private lastOnlineCheck: Date = new Date(0);
  private isOnlineCache: boolean = false;
  private cacheTimeout: number = 30000; // 30 seconds

  constructor() {
    this.apiClient = new ApiClient();
  }

  async isOnline(): Promise<boolean> {
    const now = new Date();
    
    // Use cached result if recent
    if (now.getTime() - this.lastOnlineCheck.getTime() < this.cacheTimeout) {
      return this.isOnlineCache;
    }

    try {
      // Test connection to remote server
      this.isOnlineCache = await this.apiClient.testConnection();
      this.lastOnlineCheck = now;
      
      return this.isOnlineCache;
    } catch (error: any) {
      this.isOnlineCache = false;
      this.lastOnlineCheck = now;
      return false;
    }
  }

  async getNetworkStatus() {
    const isOnline = await this.isOnline();
    const serverInfo = isOnline ? await this.apiClient.getServerInfo() : null;

    return {
      isOnline,
      lastCheck: this.lastOnlineCheck,
      serverInfo,
      latency: await this.measureLatency()
    };
  }

  private async measureLatency(): Promise<number | null> {
    if (!this.isOnlineCache) return null;

    try {
      const start = Date.now();
      await this.apiClient.testConnection();
      return Date.now() - start;
    } catch (error: any) {
      return null;
    }
  }

  // Monitor network status changes
  startNetworkMonitoring(callback: (isOnline: boolean) => void) {
    let wasOnline = this.isOnlineCache;

    setInterval(async () => {
      const isOnline = await this.isOnline();
      
      if (isOnline !== wasOnline) {
        console.log(`Network status changed: ${isOnline ? 'Online' : 'Offline'}`);
        callback(isOnline);
        wasOnline = isOnline;
      }
    }, 60000); // Check every minute
  }
}