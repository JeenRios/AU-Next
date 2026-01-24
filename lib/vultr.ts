/**
 * Vultr API Client
 * Documentation: https://www.vultr.com/api/
 *
 * This module handles Vultr VPS provisioning for automated MT5 trading.
 */

const VULTR_API_BASE = 'https://api.vultr.com/v2';

interface VultrConfig {
  apiKey: string;
}

interface VultrInstance {
  id: string;
  main_ip: string;
  vcpu_count: number;
  ram: number;
  disk: number;
  region: string;
  plan: string;
  os: string;
  os_id: number;
  status: string;
  power_status: string;
  server_status: string;
  allowed_bandwidth: number;
  label: string;
  date_created: string;
  default_password?: string;
  internal_ip?: string;
  hostname?: string;
}

interface VultrPlan {
  id: string;
  vcpu_count: number;
  ram: number;
  disk: number;
  bandwidth: number;
  monthly_cost: number;
  type: string;
  locations: string[];
}

interface VultrRegion {
  id: string;
  city: string;
  country: string;
  continent: string;
  options: string[];
}

interface VultrOS {
  id: number;
  name: string;
  arch: string;
  family: string;
}

interface CreateInstanceParams {
  region: string;
  plan: string;
  os_id: number;
  label?: string;
  hostname?: string;
  enable_ipv6?: boolean;
  backups?: 'enabled' | 'disabled';
  ddos_protection?: boolean;
  activation_email?: boolean;
  user_data?: string;
  script_id?: string;
}

class VultrClient {
  private apiKey: string;

  constructor(config: VultrConfig) {
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${VULTR_API_BASE}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error || `Vultr API error: ${response.status} ${response.statusText}`
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Get account information
   */
  async getAccount(): Promise<{ account: { balance: number; pending_charges: number; last_payment_date: string; last_payment_amount: number } }> {
    return this.request('/account');
  }

  /**
   * List all available regions
   */
  async listRegions(): Promise<{ regions: VultrRegion[] }> {
    return this.request('/regions');
  }

  /**
   * List available plans
   * @param type - 'all', 'vc2', 'vhf', 'vdc', 'vhp', etc.
   */
  async listPlans(type: string = 'all'): Promise<{ plans: VultrPlan[] }> {
    return this.request(`/plans?type=${type}`);
  }

  /**
   * List available operating systems
   */
  async listOS(): Promise<{ os: VultrOS[] }> {
    return this.request('/os');
  }

  /**
   * Get Windows OS options
   */
  async getWindowsOS(): Promise<VultrOS[]> {
    const { os } = await this.listOS();
    return os.filter(o => o.family === 'windows');
  }

  /**
   * Create a new VPS instance
   */
  async createInstance(params: CreateInstanceParams): Promise<{ instance: VultrInstance }> {
    return this.request('/instances', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Get instance details
   */
  async getInstance(instanceId: string): Promise<{ instance: VultrInstance }> {
    return this.request(`/instances/${instanceId}`);
  }

  /**
   * List all instances
   */
  async listInstances(): Promise<{ instances: VultrInstance[] }> {
    return this.request('/instances');
  }

  /**
   * Delete an instance
   */
  async deleteInstance(instanceId: string): Promise<void> {
    await this.request(`/instances/${instanceId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Reboot an instance
   */
  async rebootInstance(instanceId: string): Promise<void> {
    await this.request(`/instances/${instanceId}/reboot`, {
      method: 'POST',
    });
  }

  /**
   * Start an instance
   */
  async startInstance(instanceId: string): Promise<void> {
    await this.request(`/instances/${instanceId}/start`, {
      method: 'POST',
    });
  }

  /**
   * Stop an instance
   */
  async stopInstance(instanceId: string): Promise<void> {
    await this.request(`/instances/${instanceId}/halt`, {
      method: 'POST',
    });
  }

  /**
   * Reinstall an instance
   */
  async reinstallInstance(instanceId: string, hostname?: string): Promise<{ instance: VultrInstance }> {
    return this.request(`/instances/${instanceId}/reinstall`, {
      method: 'POST',
      body: JSON.stringify({ hostname }),
    });
  }

  /**
   * Get instance bandwidth usage
   */
  async getInstanceBandwidth(instanceId: string): Promise<{ bandwidth: Record<string, { incoming_bytes: number; outgoing_bytes: number }> }> {
    return this.request(`/instances/${instanceId}/bandwidth`);
  }
}

// Singleton instance
let vultrClient: VultrClient | null = null;

/**
 * Get or create Vultr client instance
 */
export function getVultrClient(): VultrClient {
  if (!vultrClient) {
    const apiKey = process.env.VULTR_API_KEY;
    if (!apiKey) {
      throw new Error('VULTR_API_KEY environment variable is not set');
    }
    vultrClient = new VultrClient({ apiKey });
  }
  return vultrClient;
}

/**
 * Check if Vultr is configured
 */
export function isVultrConfigured(): boolean {
  return !!process.env.VULTR_API_KEY;
}

// Recommended Windows plans for MT5 trading
export const RECOMMENDED_PLANS = {
  // Windows Cloud Compute - Good for single EA
  basic: {
    plan: 'vc2-1c-2gb',  // 1 vCPU, 2GB RAM, 55GB SSD
    description: 'Basic - 1 vCPU, 2GB RAM',
    monthlyPrice: 24,
  },
  // Windows Cloud Compute - Better for multiple EAs
  standard: {
    plan: 'vc2-2c-4gb',  // 2 vCPU, 4GB RAM, 80GB SSD
    description: 'Standard - 2 vCPU, 4GB RAM',
    monthlyPrice: 48,
  },
  // Windows High Frequency - Best performance
  performance: {
    plan: 'vhf-1c-2gb',  // 1 vCPU, 2GB RAM, 64GB NVMe
    description: 'High Frequency - 1 vCPU, 2GB RAM NVMe',
    monthlyPrice: 30,
  },
};

// Recommended regions for trading (low latency to major brokers)
export const RECOMMENDED_REGIONS = {
  // North America
  'ewr': { name: 'New Jersey', country: 'US', latency: 'Low to US brokers' },
  'ord': { name: 'Chicago', country: 'US', latency: 'Low to US brokers' },
  // Europe
  'lhr': { name: 'London', country: 'UK', latency: 'Low to EU/UK brokers' },
  'fra': { name: 'Frankfurt', country: 'DE', latency: 'Low to EU brokers' },
  'ams': { name: 'Amsterdam', country: 'NL', latency: 'Low to EU brokers' },
  // Asia
  'sgp': { name: 'Singapore', country: 'SG', latency: 'Low to Asia brokers' },
  'nrt': { name: 'Tokyo', country: 'JP', latency: 'Low to Japan brokers' },
};

// Windows Server OS IDs (Vultr specific)
export const WINDOWS_OS = {
  'windows-2022': 1713,  // Windows Server 2022
  'windows-2019': 1404,  // Windows Server 2019
  'windows-2016': 240,   // Windows Server 2016
};

export type { VultrInstance, VultrPlan, VultrRegion, VultrOS, CreateInstanceParams };
export { VultrClient };
