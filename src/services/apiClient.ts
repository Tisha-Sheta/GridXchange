import {
  User,
  EnergyListing,
  EnergyRequirement,
  MatchRecord,
  Trade,
  PriceBreakdown,
  AppNotification,
  CommunityImpactStats,
  GridZone,
} from '../types';

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('gridxchange_token');
  }

  public setToken(token: string | null) {
    if (token) {
      localStorage.setItem('gridxchange_token', token);
    } else {
      localStorage.removeItem('gridxchange_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${text.slice(0, 100)}`);
      }
      throw new Error(`Expected JSON but received ${contentType}`);
    }

    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data.data !== undefined ? data.data : data;
  }

  // Auth
  public async login(email: string, password: string) {
    const res = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  public async demoLogin(identifier: 'C001' | 'P001' | 'P002' | 'P003' | 'admin') {
    const res = await this.request<{ user: User; token: string }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
    this.setToken(res.token);
    return res;
  }

  public async register(payload: any) {
    const res = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  }

  public async getProfile() {
    return this.request<User & { roleData: any }>('/users/profile');
  }

  public logout() {
    this.setToken(null);
  }

  // Prosumer
  public async getProsumerDashboard(userId?: string) {
    const query = userId ? `?userId=${userId}` : '';
    return this.request<any>(`/prosumer/dashboard${query}`);
  }

  public async getProsumerEnergySeries() {
    return this.request<any[]>('/prosumer/energy');
  }

  // Listings
  public async getListings(status?: string, gridZoneId?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (gridZoneId) params.append('gridZoneId', gridZoneId);
    return this.request<EnergyListing[]>(`/listings?${params.toString()}`);
  }

  public async createListing(payload: any) {
    return this.request<EnergyListing>('/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Requirements & Matching
  public async getRequirements() {
    return this.request<EnergyRequirement[]>('/requirements');
  }

  public async createRequirement(payload: any) {
    return this.request<{ requirement: EnergyRequirement; matches: MatchRecord[] }>('/requirements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getMatches(requirementId: string) {
    return this.request<MatchRecord[]>(`/matches/${requirementId}`);
  }

  public async getPricingBreakdown(listingId: string, maxPrice?: number) {
    const query = maxPrice ? `?maxPrice=${maxPrice}` : '';
    return this.request<PriceBreakdown>(`/pricing/${listingId}${query}`);
  }

  // Trades
  public async getTrades() {
    return this.request<Trade[]>('/trades');
  }

  public async getTrade(id: string) {
    return this.request<Trade>(`/trades/${id}`);
  }

  public async confirmTrade(payload: {
    listing_id: string;
    requirement_id?: string;
    quantity: number;
    price: number;
  }) {
    return this.request<Trade>('/trades/confirm', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async advanceTradeStatus(tradeId: string, status: string) {
    return this.request<Trade>(`/trades/${tradeId}/advance-status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  public async simulateDelivery(tradeId: string) {
    return this.request<{ trade: Trade; settlements: any[]; message: string }>(
      `/trades/${tradeId}/simulate-delivery`,
      {
        method: 'POST',
      }
    );
  }

  public async settleTrade(tradeId: string) {
    return this.request<{ trade: Trade; settlements: any[]; message: string }>(
      `/trades/${tradeId}/settle`,
      {
        method: 'POST',
      }
    );
  }

  // Rebalancing & Settlements
  public async triggerRebalancing(tradeId: string, actualDeliveredQuantity = 3.5) {
    return this.request<{ trade: Trade; allocation: any; message: string }>(`/rebalancing/${tradeId}`, {
      method: 'POST',
      body: JSON.stringify({ actualDeliveredQuantity }),
    });
  }

  public async getSettlements(tradeId?: string) {
    const query = tradeId ? `?tradeId=${tradeId}` : '';
    return this.request<any[]>(`/settlements${query}`);
  }

  // Grid Zones
  public async getGridZones() {
    return this.request<GridZone[]>('/grid/zones');
  }

  public async updateGridZoneCongestion(id: string, congestion_level: string) {
    return this.request<GridZone>(`/grid/zones/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ congestion_level }),
    });
  }

  // Notifications
  public async getNotifications() {
    return this.request<AppNotification[]>('/notifications');
  }

  public async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  // Community
  public async getCommunityImpact() {
    return this.request<CommunityImpactStats>('/community/impact');
  }

  // Admin
  public async getAdminDashboard() {
    return this.request<any>('/admin/dashboard');
  }

  public async getAdminUsers() {
    return this.request<any[]>('/admin/users');
  }

  public async toggleUserStatus(id: string, status: 'active' | 'inactive') {
    return this.request<User>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  public async simulateMeterShortfall(payload: { prosumerId?: string; actualDelivered?: number; tradeId?: string }) {
    return this.request<any>('/admin/meter/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async resetDatabase() {
    return this.request<any>('/admin/reset', {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
