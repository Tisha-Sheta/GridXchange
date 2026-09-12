export type UserRole = 'consumer' | 'prosumer' | 'admin';
export type UserStatus = 'active' | 'inactive';
export type CongestionLevel = 'Low' | 'Medium' | 'High';

export type ListingStatus = 'Available' | 'Reserved' | 'Matched' | 'Completed' | 'Expired' | 'Cancelled';
export type RequirementStatus = 'Open' | 'Matching' | 'Matched' | 'Partially fulfilled' | 'Fulfilled' | 'Cancelled' | 'Expired';
export type TradeStatus = 'Matched' | 'Confirmed' | 'Scheduled' | 'Meter Verified' | 'Rebalanced' | 'Partially Fulfilled' | 'Settled' | 'Cancelled';
export type SettlementStatus = 'Pending' | 'Completed';
export type BackupAllocationStatus = 'Pending' | 'Allocated' | 'Completed';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  password_hash?: string;
}

export interface Prosumer {
  id: string;
  user_id: string;
  solar_capacity: number; // in kW
  reliability_score: number; // 0 - 100
  total_energy_sold: number; // in kWh
  total_earnings: number; // in ₹
  user?: User;
  smart_meter?: SmartMeter;
}

export interface Consumer {
  id: string;
  user_id: string;
  total_energy_purchased: number; // in kWh
  total_savings: number; // in ₹
  user?: User;
}

export interface GridZone {
  id: string;
  zone_name: 'A' | 'B' | 'C';
  congestion_level: CongestionLevel;
  updated_at: string;
}

export interface SmartMeter {
  id: string;
  user_id: string;
  meter_number: string;
  grid_zone_id: string;
  grid_zone?: GridZone;
}

export interface MeterReading {
  id: string;
  meter_id: string;
  timestamp: string;
  generation: number; // kWh
  consumption: number; // kWh
  surplus: number; // kWh
}

export interface EnergyListing {
  id: string;
  prosumer_id: string;
  quantity: number; // kWh
  price: number; // ₹/kWh
  start_time: string; // ISO or HH:mm
  end_time: string; // ISO or HH:mm
  date: string; // YYYY-MM-DD
  grid_zone_id: string;
  status: ListingStatus;
  created_at: string;
  prosumer?: Prosumer;
  grid_zone?: GridZone;
}

export interface EnergyRequirement {
  id: string;
  consumer_id: string;
  quantity: number; // kWh
  max_price: number; // ₹/kWh
  start_time: string;
  end_time: string;
  date: string;
  preferred_zone?: string;
  status: RequirementStatus;
  created_at: string;
  consumer?: Consumer;
}

export interface MatchScoreReason {
  label: string;
  passed: boolean;
  detail: string;
}

export interface MatchRecord {
  id: string;
  requirement_id: string;
  listing_id: string;
  match_score: number; // 0 - 100
  reasons: MatchScoreReason[];
  pricing_breakdown: PriceBreakdown;
  created_at: string;
  listing?: EnergyListing;
  prosumer?: Prosumer;
}

export interface PriceBreakdown {
  base_price: number;
  demand_factor: number;
  supply_factor: number;
  congestion_factor: number;
  final_price: number;
  currency: string;
}

export interface Trade {
  id: string;
  buyer_id: string; // consumer_id
  seller_id: string; // prosumer_id
  listing_id?: string;
  requirement_id?: string;
  quantity: number; // agreed kWh
  price: number; // ₹/kWh
  total_amount: number; // ₹
  status: TradeStatus;
  scheduled_time: string;
  time_window: string;
  date: string;
  created_at: string;
  updated_at: string;
  buyer?: Consumer;
  seller?: Prosumer;
  backup_allocation?: BackupAllocation;
  settlements?: Settlement[];
}

export interface Settlement {
  id: string;
  trade_id: string;
  seller_id: string;
  actual_quantity: number;
  seller_amount: number;
  buyer_amount: number;
  settlement_status: SettlementStatus;
  created_at: string;
  seller?: Prosumer;
}

export interface ForecastRecord {
  id: string;
  prosumer_id: string;
  predicted_generation: number;
  predicted_consumption: number;
  predicted_surplus: number;
  confidence_score: number;
  prediction_time: string;
}

export interface BackupAllocation {
  id: string;
  trade_id: string;
  primary_seller_id: string;
  backup_seller_id: string;
  shortfall_quantity: number;
  primary_actual_quantity: number;
  status: BackupAllocationStatus;
  created_at: string;
  primary_seller?: Prosumer;
  backup_seller?: Prosumer;
}

export interface AppNotification {
  id: string;
  user_id: string;
  message: string;
  type: string;
  read_status: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface CommunityImpactStats {
  total_renewable_traded_kwh: number;
  total_renewable_utilized_kwh: number;
  active_prosumers_count: number;
  active_consumers_count: number;
  total_trades_count: number;
  completed_trades_count: number;
  active_trades_count: number;
  total_trade_value_inr: number;
  aggregate_seller_earnings_inr: number;
  aggregate_buyer_savings_inr: number;
  rebalanced_energy_kwh: number;
  grid_zones_status: {
    zone_name: string;
    congestion_level: CongestionLevel;
  }[];
}
