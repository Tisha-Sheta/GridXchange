import {
  User,
  Prosumer,
  Consumer,
  GridZone,
  SmartMeter,
  MeterReading,
  EnergyListing,
  EnergyRequirement,
  MatchRecord,
  Trade,
  Settlement,
  ForecastRecord,
  BackupAllocation,
  AppNotification,
  CommunityImpactStats,
  CongestionLevel,
} from '../src/types';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export interface DatabaseState {
  users: User[];
  prosumers: Prosumer[];
  consumers: Consumer[];
  grid_zones: GridZone[];
  smart_meters: SmartMeter[];
  meter_readings: MeterReading[];
  energy_listings: EnergyListing[];
  energy_requirements: EnergyRequirement[];
  matches: MatchRecord[];
  trades: Trade[];
  settlements: Settlement[];
  forecasts: ForecastRecord[];
  backup_allocations: BackupAllocation[];
  notifications: AppNotification[];
}

function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function createInitialSeedData(): DatabaseState {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // 1. Grid Zones (Section 28)
  const grid_zones: GridZone[] = [
    { id: 'zone_a', zone_name: 'A', congestion_level: 'Low', updated_at: now.toISOString() },
    { id: 'zone_b', zone_name: 'B', congestion_level: 'Medium', updated_at: now.toISOString() },
    { id: 'zone_c', zone_name: 'C', congestion_level: 'High', updated_at: now.toISOString() },
  ];

  // 2. Users (Admin, Consumer C001, Prosumers P001, P002, P003)
  const users: User[] = [
    {
      id: 'usr_admin',
      name: 'Grid Dispatch Operator (Admin)',
      email: 'admin@gridxchange.io',
      phone: '+91 98200 11000',
      location: 'Regional Energy Dispatch Center, Sector 4',
      role: 'admin',
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      password_hash: hashPassword('admin123'),
    },
    {
      id: 'usr_c001',
      name: 'Ananya Sharma (C001)',
      email: 'c001@gridxchange.io',
      phone: '+91 98450 23456',
      location: 'Greenwood Residences, Zone A',
      role: 'consumer',
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
      password_hash: hashPassword('password123'),
    },
    {
      id: 'usr_p001',
      name: 'SunPower Apex (P001)',
      email: 'p001@gridxchange.io',
      phone: '+91 97110 34567',
      location: 'Apex Villa Rooftop Solar, Zone A',
      role: 'prosumer',
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
      password_hash: hashPassword('password123'),
    },
    {
      id: 'usr_p002',
      name: 'SolarReserve Beta (P002)',
      email: 'p002@gridxchange.io',
      phone: '+91 98110 45678',
      location: 'Beta Heights Microgrid, Zone B',
      role: 'prosumer',
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
      password_hash: hashPassword('password123'),
    },
    {
      id: 'usr_p003',
      name: 'HelioGrid Gamma (P003)',
      email: 'p003@gridxchange.io',
      phone: '+91 99220 56789',
      location: 'Gamma Industrial Cluster, Zone C',
      role: 'prosumer',
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
      password_hash: hashPassword('password123'),
    },
  ];

  // 3. Consumers Table
  const consumers: Consumer[] = [
    {
      id: 'c_001',
      user_id: 'usr_c001',
      total_energy_purchased: 142.5, // lifetime kWh
      total_savings: 427.5, // lifetime ₹
    },
  ];

  // 4. Prosumers Table
  const prosumers: Prosumer[] = [
    {
      id: 'p_001',
      user_id: 'usr_p001',
      solar_capacity: 10.0, // 10 kW
      reliability_score: 92, // 92%
      total_energy_sold: 284.0, // kWh
      total_earnings: 2130.0, // ₹
    },
    {
      id: 'p_002',
      user_id: 'usr_p002',
      solar_capacity: 6.0,
      reliability_score: 88,
      total_energy_sold: 195.0,
      total_earnings: 1462.5,
    },
    {
      id: 'p_003',
      user_id: 'usr_p003',
      solar_capacity: 8.0,
      reliability_score: 85,
      total_energy_sold: 210.0,
      total_earnings: 1680.0,
    },
  ];

  // 5. Smart Meters
  const smart_meters: SmartMeter[] = [
    { id: 'meter_001', user_id: 'usr_p001', meter_number: 'M001', grid_zone_id: 'zone_a' },
    { id: 'meter_002', user_id: 'usr_p002', meter_number: 'M002', grid_zone_id: 'zone_b' },
    { id: 'meter_003', user_id: 'usr_p003', meter_number: 'M003', grid_zone_id: 'zone_c' },
  ];

  // 6. Meter Readings (Seeded with Section 28 & 6.2 values: P001 Gen 9.0 kWh, Cons 3.0 kWh, Surplus 6.0 kWh)
  const meter_readings: MeterReading[] = [];
  
  // Historical readings for P001 to support forecasting curve
  const hourlyCurveP1 = [
    { h: 8, gen: 2.1, cons: 2.0 },
    { h: 9, gen: 4.2, cons: 2.2 },
    { h: 10, gen: 6.5, cons: 2.4 },
    { h: 11, gen: 8.0, cons: 2.5 },
    { h: 12, gen: 9.8, cons: 3.1 },
    { h: 13, gen: 9.5, cons: 3.0 },
    { h: 14, gen: 9.0, cons: 3.0 }, // 2 PM: Gen 9, Cons 3, Surplus 6 (Section 6.2 & 28)
    { h: 15, gen: 7.8, cons: 2.8 },
    { h: 16, gen: 5.5, cons: 2.6 },
    { h: 17, gen: 3.2, cons: 2.5 },
  ];

  for (const item of hourlyCurveP1) {
    meter_readings.push({
      id: `mr_p1_${item.h}`,
      meter_id: 'meter_001',
      timestamp: `${today}T${String(item.h).padStart(2, '0')}:00:00.000Z`,
      generation: item.gen,
      consumption: item.cons,
      surplus: parseFloat((item.gen - item.cons).toFixed(1)),
    });
  }

  // P002 (Surplus 3.2 kWh)
  meter_readings.push({
    id: 'mr_p2_14',
    meter_id: 'meter_002',
    timestamp: `${today}T14:00:00.000Z`,
    generation: 5.4,
    consumption: 2.2,
    surplus: 3.2,
  });

  // P003 (Surplus 5.1 kWh)
  meter_readings.push({
    id: 'mr_p3_14',
    meter_id: 'meter_003',
    timestamp: `${today}T14:00:00.000Z`,
    generation: 7.6,
    consumption: 2.5,
    surplus: 5.1,
  });

  // 7. Forecasts (Section 28: P001 predicted surplus 5.8 kWh at 2-3 PM)
  const forecasts: ForecastRecord[] = [
    {
      id: 'fc_p001',
      prosumer_id: 'p_001',
      predicted_generation: 8.8,
      predicted_consumption: 3.0,
      predicted_surplus: 5.8, // 5.8 kWh predicted surplus for 2-3 PM!
      confidence_score: 94,
      prediction_time: `${today}T14:00:00.000Z`,
    },
    {
      id: 'fc_p002',
      prosumer_id: 'p_002',
      predicted_generation: 5.3,
      predicted_consumption: 2.1,
      predicted_surplus: 3.2,
      confidence_score: 89,
      prediction_time: `${today}T14:00:00.000Z`,
    },
    {
      id: 'fc_p003',
      prosumer_id: 'p_003',
      predicted_generation: 7.5,
      predicted_consumption: 2.4,
      predicted_surplus: 5.1,
      confidence_score: 86,
      prediction_time: `${today}T14:00:00.000Z`,
    },
  ];

  // 8. Energy Listings (Section 10.3 & 28)
  const energy_listings: EnergyListing[] = [
    {
      id: 'lst_001',
      prosumer_id: 'p_001',
      quantity: 6.0, // 6 kWh listed
      price: 7.0, // ₹7/kWh listed base (priced to ₹7.50 after dynamic factors)
      date: today,
      start_time: '14:00',
      end_time: '15:00',
      grid_zone_id: 'zone_a',
      status: 'Available',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'lst_002',
      prosumer_id: 'p_002',
      quantity: 3.2,
      price: 7.2,
      date: today,
      start_time: '14:00',
      end_time: '15:00',
      grid_zone_id: 'zone_b',
      status: 'Available',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'lst_003',
      prosumer_id: 'p_003',
      quantity: 5.1,
      price: 8.5,
      date: today,
      start_time: '14:00',
      end_time: '15:00',
      grid_zone_id: 'zone_c',
      status: 'Available',
      created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
  ];

  // 9. Energy Requirements (Section 28: C001 5 kWh, 2-3 PM, max ₹8/kWh)
  const energy_requirements: EnergyRequirement[] = [
    {
      id: 'req_001',
      consumer_id: 'c_001',
      quantity: 5.0,
      max_price: 8.0,
      date: today,
      start_time: '14:00',
      end_time: '15:00',
      preferred_zone: 'Zone A',
      status: 'Open',
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  // 10. Notifications
  const notifications: AppNotification[] = [
    {
      id: 'notif_init_1',
      user_id: 'usr_c001',
      type: 'system_welcome',
      message: 'Welcome to GridXchange. Your smart solar connection is online.',
      read_status: false,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'notif_init_2',
      user_id: 'usr_p001',
      type: 'forecast_ready',
      message: 'Peak solar surplus forecasted: 5.8 kWh available between 14:00 - 15:00.',
      read_status: false,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];

  // 11. Initial Historical Trades & Settlements (for rich seed community metrics)
  const historicalTradeId = 'trd_hist_091';
  const trades: Trade[] = [
    {
      id: historicalTradeId,
      buyer_id: 'c_001',
      seller_id: 'p_001',
      listing_id: 'lst_hist_01',
      requirement_id: 'req_hist_01',
      quantity: 4.5,
      price: 7.2,
      total_amount: 32.4,
      status: 'Settled',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      scheduled_time: '13:00 - 14:00',
      time_window: '13:00 - 14:00',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000 + 3600000).toISOString(),
    },
  ];

  const settlements: Settlement[] = [
    {
      id: 'stl_hist_01',
      trade_id: historicalTradeId,
      seller_id: 'p_001',
      actual_quantity: 4.5,
      seller_amount: 32.4,
      buyer_amount: 32.4,
      settlement_status: 'Completed',
      created_at: new Date(Date.now() - 86400000 + 3600000).toISOString(),
    },
  ];

  return {
    users,
    prosumers,
    consumers,
    grid_zones,
    smart_meters,
    meter_readings,
    energy_listings,
    energy_requirements,
    matches: [],
    trades,
    settlements,
    forecasts,
    backup_allocations: [],
    notifications,
  };
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'server', 'data', 'database.json');

class Database {
  private state: DatabaseState;
  private dbPath: string;

  constructor() {
    this.dbPath = DB_FILE_PATH;
    this.state = this.loadFromFile();
  }

  private loadFromFile(): DatabaseState {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read persistent DB file, initializing seed data:', err);
    }
    const initial = createInitialSeedData();
    this.saveState(initial);
    return initial;
  }

  private saveState(stateToSave?: DatabaseState): void {
    try {
      const data = stateToSave || this.state;
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save DB state to file:', err);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public resetToSeed(): DatabaseState {
    this.state = createInitialSeedData();
    this.saveState();
    return this.state;
  }

  // Users & Auth
  public findUserByEmail(email: string): User | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public createUser(userData: Omit<User, 'id' | 'created_at'>): User {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const user: User = {
      ...userData,
      id,
      created_at: new Date().toISOString(),
    };
    this.state.users.push(user);
    this.saveState();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.state.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    this.state.users[index] = { ...this.state.users[index], ...updates };
    this.saveState();
    return this.state.users[index];
  }

  // Prosumers
  public getProsumerByUserId(userId: string): Prosumer | undefined {
    return this.state.prosumers.find((p) => p.user_id === userId);
  }

  public getProsumerById(id: string): Prosumer | undefined {
    return this.state.prosumers.find((p) => p.id === id);
  }

  public createProsumer(data: Omit<Prosumer, 'id'>): Prosumer {
    const id = `p_${Date.now()}`;
    const prosumer: Prosumer = { ...data, id };
    this.state.prosumers.push(prosumer);
    this.saveState();
    return prosumer;
  }

  // Consumers
  public getConsumerByUserId(userId: string): Consumer | undefined {
    return this.state.consumers.find((c) => c.user_id === userId);
  }

  public getConsumerById(id: string): Consumer | undefined {
    return this.state.consumers.find((c) => c.id === id);
  }

  public createConsumer(data: Omit<Consumer, 'id'>): Consumer {
    const id = `c_${Date.now()}`;
    const consumer: Consumer = { ...data, id };
    this.state.consumers.push(consumer);
    this.saveState();
    return consumer;
  }

  // Grid Zones
  public getGridZones(): GridZone[] {
    return this.state.grid_zones;
  }

  public getGridZoneById(id: string): GridZone | undefined {
    if (!id) return undefined;
    const lower = String(id).toLowerCase();
    return this.state.grid_zones.find(
      (z) =>
        z.id.toLowerCase() === lower ||
        z.zone_name.toLowerCase() === lower ||
        lower.includes(`zone_${z.zone_name.toLowerCase()}`) ||
        lower.includes(`zone ${z.zone_name.toLowerCase()}`)
    );
  }

  public updateGridZoneCongestion(id: string, congestion: CongestionLevel): GridZone | undefined {
    const zone = this.state.grid_zones.find((z) => z.id === id || z.zone_name.toLowerCase() === id.toLowerCase());
    if (!zone) return undefined;
    zone.congestion_level = congestion;
    zone.updated_at = new Date().toISOString();
    this.saveState();
    return zone;
  }

  // Smart Meters & Readings
  public getMeterByUserId(userId: string): SmartMeter | undefined {
    return this.state.smart_meters.find((m) => m.user_id === userId);
  }

  public getMeterById(id: string): SmartMeter | undefined {
    return this.state.smart_meters.find((m) => m.id === id);
  }

  public getReadingsForMeter(meterId: string): MeterReading[] {
    return this.state.meter_readings.filter((r) => r.meter_id === meterId);
  }

  public getLatestReadingForMeter(meterId: string): MeterReading | undefined {
    const readings = this.getReadingsForMeter(meterId);
    if (readings.length === 0) return undefined;
    return readings[readings.length - 1];
  }

  public addMeterReading(data: Omit<MeterReading, 'id'>): MeterReading {
    const id = `mr_${Date.now()}`;
    const reading: MeterReading = { ...data, id };
    this.state.meter_readings.push(reading);
    this.saveState();
    return reading;
  }

  // Forecasts
  public getForecastForProsumer(prosumerId: string): ForecastRecord | undefined {
    return this.state.forecasts.find((f) => f.prosumer_id === prosumerId);
  }

  public setForecast(data: Omit<ForecastRecord, 'id'>): ForecastRecord {
    const existingIndex = this.state.forecasts.findIndex((f) => f.prosumer_id === data.prosumer_id);
    const record: ForecastRecord = {
      ...data,
      id: existingIndex >= 0 ? this.state.forecasts[existingIndex].id : `fc_${Date.now()}`,
    };
    if (existingIndex >= 0) {
      this.state.forecasts[existingIndex] = record;
    } else {
      this.state.forecasts.push(record);
    }
    this.saveState();
    return record;
  }

  // Listings
  public getListings(filter?: { status?: string; gridZoneId?: string }): EnergyListing[] {
    return this.state.energy_listings.filter((l) => {
      if (filter?.status && l.status !== filter.status) return false;
      if (filter?.gridZoneId && l.grid_zone_id !== filter.gridZoneId) return false;
      return true;
    });
  }

  public getListingById(id: string): EnergyListing | undefined {
    return this.state.energy_listings.find((l) => l.id === id);
  }

  public createListing(data: Omit<EnergyListing, 'id' | 'created_at'>): EnergyListing {
    const id = `lst_${Date.now()}`;
    const listing: EnergyListing = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };
    this.state.energy_listings.push(listing);
    this.saveState();
    return listing;
  }

  public updateListingStatus(id: string, status: EnergyListing['status']): EnergyListing | undefined {
    const listing = this.getListingById(id);
    if (!listing) return undefined;
    listing.status = status;
    this.saveState();
    return listing;
  }

  // Requirements
  public getRequirements(filter?: { consumerId?: string; status?: string }): EnergyRequirement[] {
    return this.state.energy_requirements.filter((r) => {
      if (filter?.consumerId && r.consumer_id !== filter.consumerId) return false;
      if (filter?.status && r.status !== filter.status) return false;
      return true;
    });
  }

  public getRequirementById(id: string): EnergyRequirement | undefined {
    return this.state.energy_requirements.find((r) => r.id === id);
  }

  public createRequirement(data: Omit<EnergyRequirement, 'id' | 'created_at'>): EnergyRequirement {
    const id = `req_${Date.now()}`;
    const requirement: EnergyRequirement = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };
    this.state.energy_requirements.push(requirement);
    this.saveState();
    return requirement;
  }

  public updateRequirementStatus(id: string, status: EnergyRequirement['status']): EnergyRequirement | undefined {
    const req = this.getRequirementById(id);
    if (!req) return undefined;
    req.status = status;
    this.saveState();
    return req;
  }

  // Matches
  public getMatchesForRequirement(requirementId: string): MatchRecord[] {
    return this.state.matches.filter((m) => m.requirement_id === requirementId);
  }

  public setMatchesForRequirement(requirementId: string, matches: MatchRecord[]): void {
    this.state.matches = this.state.matches.filter((m) => m.requirement_id !== requirementId);
    this.state.matches.push(...matches);
    this.saveState();
  }

  // Trades
  public getTrades(filter?: { buyerId?: string; sellerId?: string; status?: string }): Trade[] {
    return this.state.trades.filter((t) => {
      if (filter?.buyerId && t.buyer_id !== filter.buyerId) return false;
      if (filter?.sellerId && t.seller_id !== filter.sellerId) return false;
      if (filter?.status && t.status !== filter.status) return false;
      return true;
    });
  }

  public getTradeById(id: string): Trade | undefined {
    return this.state.trades.find((t) => t.id === id);
  }

  public createTrade(data: Omit<Trade, 'id' | 'created_at' | 'updated_at'>): Trade {
    const id = `trd_${Date.now()}`;
    const trade: Trade = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.trades.push(trade);
    this.saveState();
    return trade;
  }

  public updateTrade(id: string, updates: Partial<Trade>): Trade | undefined {
    const index = this.state.trades.findIndex((t) => t.id === id);
    if (index === -1) return undefined;
    this.state.trades[index] = {
      ...this.state.trades[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveState();
    return this.state.trades[index];
  }

  // Settlements
  public getSettlements(tradeId?: string): Settlement[] {
    if (tradeId) {
      return this.state.settlements.filter((s) => s.trade_id === tradeId);
    }
    return this.state.settlements;
  }

  public createSettlement(data: Omit<Settlement, 'id' | 'created_at'>): Settlement {
    const id = `stl_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const settlement: Settlement = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };
    this.state.settlements.push(settlement);
    this.saveState();
    return settlement;
  }

  // Backup Allocations
  public getBackupAllocations(tradeId?: string): BackupAllocation[] {
    if (tradeId) {
      return this.state.backup_allocations.filter((b) => b.trade_id === tradeId);
    }
    return this.state.backup_allocations;
  }

  public createBackupAllocation(data: Omit<BackupAllocation, 'id' | 'created_at'>): BackupAllocation {
    const id = `bkp_${Date.now()}`;
    const allocation: BackupAllocation = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };
    this.state.backup_allocations.push(allocation);
    this.saveState();
    return allocation;
  }

  // Notifications
  public getNotificationsForUser(userId: string): AppNotification[] {
    return this.state.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createNotification(
    data: Omit<AppNotification, 'id' | 'created_at' | 'read_status'> & { read_status?: boolean }
  ): AppNotification {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const notif: AppNotification = {
      read_status: false,
      ...data,
      id,
      created_at: new Date().toISOString(),
    };
    this.state.notifications.push(notif);
    this.saveState();
    return notif;
  }

  public markNotificationRead(id: string): boolean {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.read_status = true;
    this.saveState();
    return true;
  }

  // Community Analytics
  public getCommunityImpact(): CommunityImpactStats {
    const completedTrades = this.state.trades.filter(
      (t) => t.status === 'Settled' || t.status === 'Meter Verified' || t.status === 'Rebalanced'
    );
    const activeTrades = this.state.trades.filter(
      (t) => t.status === 'Confirmed' || t.status === 'Scheduled' || t.status === 'Matched'
    );

    const totalTradedKwh = completedTrades.reduce((acc, t) => acc + t.quantity, 0);
    const totalTradeValue = completedTrades.reduce((acc, t) => acc + t.total_amount, 0);

    const rebalancedKwh = this.state.backup_allocations.reduce(
      (acc, b) => acc + b.shortfall_quantity,
      0
    );

    return {
      total_renewable_traded_kwh: parseFloat(totalTradedKwh.toFixed(1)),
      total_renewable_utilized_kwh: parseFloat((totalTradedKwh * 0.98).toFixed(1)),
      active_prosumers_count: this.state.prosumers.length,
      active_consumers_count: this.state.consumers.length,
      total_trades_count: this.state.trades.length,
      completed_trades_count: completedTrades.length,
      active_trades_count: activeTrades.length,
      total_trade_value_inr: parseFloat(totalTradeValue.toFixed(2)),
      aggregate_seller_earnings_inr: parseFloat((totalTradeValue * 0.98).toFixed(2)),
      aggregate_buyer_savings_inr: parseFloat((totalTradedKwh * 2.5).toFixed(2)), // benchmark grid is ₹10 vs ₹7.50 market
      rebalanced_energy_kwh: parseFloat(rebalancedKwh.toFixed(1)),
      grid_zones_status: this.state.grid_zones.map((z) => ({
        zone_name: z.zone_name,
        congestion_level: z.congestion_level,
      })),
    };
  }
}

export const db = new Database();
