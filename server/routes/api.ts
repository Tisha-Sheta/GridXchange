import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { ForecastingService } from '../services/forecastingService';
import { MatchingService } from '../services/matchingService';
import { PricingService } from '../services/pricingService';
import { RebalancingService } from '../services/rebalancingService';
import { SettlementService } from '../services/settlementService';
import { User } from '../../src/types';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'gridxchange_secret_key_2026';

// Middleware: Authenticate User
export interface AuthRequest extends Request {
  user?: User;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    const user = db.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User session expired or not found' });
    }
    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, error: 'Account has been deactivated by administrator' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
  }
}

// Optional Auth (passes if token is present, continues if not)
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = db.findUserById(decoded.userId);
      if (user && user.status === 'active') {
        req.user = user;
      }
    } catch {
      // ignore
    }
  }
  next();
}

// Middleware: Role Guard
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: `Forbidden: Requires role [${roles.join(', ')}]` });
    }
    next();
  };
}

// ----------------------------------------------------
// 1. AUTHENTICATION & USERS (Sections 8 & 22)
// ----------------------------------------------------

router.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone, location, role, solar_capacity } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, error: 'Name, email, password, and role are required' });
  }

  if (role !== 'consumer' && role !== 'prosumer') {
    return res.status(400).json({ success: false, error: 'Role must be either consumer or prosumer' });
  }

  if (role === 'prosumer') {
    const capacityNum = Number(solar_capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Solar capacity must be a positive number greater than 0 kW',
      });
    }
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ success: false, error: 'An account with this email address already exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = db.createUser({
    name,
    email,
    phone: phone || '',
    location: location || 'Zone A',
    role,
    status: 'active',
    password_hash: passwordHash,
  });

  if (role === 'prosumer') {
    const capacity = Number(solar_capacity);
    const newProsumer = db.createProsumer({
      user_id: newUser.id,
      solar_capacity: capacity,
      reliability_score: 90,
      total_energy_sold: 0,
      total_earnings: 0,
    });

    // Auto-create unique smart meter linked to this user
    const meterNumber = `M${String(db.getState().smart_meters.length + 1).padStart(3, '0')}`;
    const gridZone = db.getGridZoneById(newUser.location)?.id || 'zone_a';
    const smartMeter = db.createSmartMeter({
      user_id: newUser.id,
      meter_number: meterNumber,
      grid_zone_id: gridZone,
    });

    // Generate simulated meter readings based on their signup solar capacity
    db.generateSimulatedReadingsForMeter(smartMeter.id, capacity);

    // Pre-generate forecast
    ForecastingService.getForecastForProsumer(newProsumer.id);
  } else {
    db.createConsumer({
      user_id: newUser.id,
      total_energy_purchased: 0,
      total_savings: 0,
    });
  }

  const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    success: true,
    data: {
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      token,
    },
  });
});

router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const user = db.findUserByEmail(email);
  if (!user || !user.password_hash) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  if (user.status === 'inactive') {
    return res.status(403).json({ success: false, error: 'This account has been deactivated' });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, location: user.location },
      token,
    },
  });
});

// Demo Fast-Login helper (allows 1-click test login as C001, P001, P002, or Admin)
router.post('/auth/demo-login', (req: Request, res: Response) => {
  const { role, identifier } = req.body;
  let targetUser: User | undefined;

  if (identifier === 'C001' || role === 'consumer') {
    targetUser = db.findUserByEmail('c001@gridxchange.io');
  } else if (identifier === 'P001') {
    targetUser = db.findUserByEmail('p001@gridxchange.io');
  } else if (identifier === 'P002') {
    targetUser = db.findUserByEmail('p002@gridxchange.io');
  } else if (identifier === 'P003') {
    targetUser = db.findUserByEmail('p003@gridxchange.io');
  } else if (role === 'admin' || identifier === 'admin') {
    targetUser = db.findUserByEmail('admin@gridxchange.io');
  } else {
    targetUser = db.getState().users[0];
  }

  if (!targetUser) {
    return res.status(404).json({ success: false, error: 'Demo user not found' });
  }

  const token = jwt.sign({ userId: targetUser.id, role: targetUser.role }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    success: true,
    data: {
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        location: targetUser.location,
      },
      token,
    },
  });
});

router.post('/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Successfully logged out' });
});

router.get('/users/profile', authenticate, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  let roleData: any = null;
  if (user.role === 'prosumer') {
    roleData = db.getProsumerByUserId(user.id);
  } else if (user.role === 'consumer') {
    roleData = db.getConsumerByUserId(user.id);
  }

  const { password_hash, ...safeUser } = user;
  res.json({
    success: true,
    data: {
      ...safeUser,
      roleData,
    },
  });
});

router.put('/users/profile', authenticate, (req: AuthRequest, res: Response) => {
  const { name, phone, location } = req.body;
  const updated = db.updateUser(req.user!.id, { name, phone, location });
  res.json({ success: true, data: updated });
});

// ----------------------------------------------------
// 2. PROSUMER DASHBOARD & ENERGY (Sections 10 & 28)
// ----------------------------------------------------

router.get('/prosumer/dashboard', optionalAuth, (req: AuthRequest, res: Response) => {
  const userId = req.query.userId ? String(req.query.userId) : (req.user?.id || 'usr_p001');
  const prosumer = db.getProsumerByUserId(userId) || db.getState().prosumers[0];
  if (!prosumer) {
    return res.status(404).json({ success: false, error: 'Prosumer record not found' });
  }

  const meter = db.getMeterByUserId(prosumer.user_id);
  const latestReading = meter ? db.getLatestReadingForMeter(meter.id) : undefined;
  const readings = meter ? db.getReadingsForMeter(meter.id) : [];
  const todayGeneration = readings.length > 0
    ? parseFloat(readings.reduce((sum, r) => sum + r.generation, 0).toFixed(1))
    : (latestReading ? parseFloat((latestReading.generation * 2.5).toFixed(1)) : 0);

  const forecast = ForecastingService.getForecastForProsumer(prosumer.id);
  const listings = db.getListings().filter((l) => l.prosumer_id === prosumer.id);
  const trades = db.getTrades({ sellerId: prosumer.id });
  const notifications = db.getNotificationsForUser(prosumer.user_id).slice(0, 5);

  res.json({
    success: true,
    data: {
      prosumer,
      meter,
      current_energy: {
        generation: latestReading ? latestReading.generation : 0.0,
        consumption: latestReading ? latestReading.consumption : 0.0,
        surplus: latestReading ? latestReading.surplus : 0.0,
      },
      today_generation: todayGeneration,
      forecast: {
        predicted_generation: forecast.predicted_generation,
        predicted_consumption: forecast.predicted_consumption,
        predicted_surplus: forecast.predicted_surplus,
        confidence: forecast.confidence_score,
      },
      listings,
      trades,
      notifications,
      stats: {
        total_energy_sold: prosumer.total_energy_sold,
        total_earnings: prosumer.total_earnings,
        reliability_score: prosumer.reliability_score,
      },
    },
  });
});

router.get('/prosumer/energy', optionalAuth, (req: AuthRequest, res: Response) => {
  const prosumer = (req.user ? db.getProsumerByUserId(req.user.id) : undefined) || db.getState().prosumers[0];
  const chartSeries = ForecastingService.getHourlyForecastSeries(prosumer.id);
  res.json({ success: true, data: chartSeries });
});

// ----------------------------------------------------
// 3. ENERGY LISTINGS (Sections 10.3, 12.1)
// ----------------------------------------------------

router.get('/listings', (req: Request, res: Response) => {
  const status = req.query.status ? String(req.query.status) : undefined;
  const gridZoneId = req.query.gridZoneId ? String(req.query.gridZoneId) : undefined;
  const listings = db.getListings({ status, gridZoneId });

  const populated = listings.map((l) => {
    const prosumer = db.getProsumerById(l.prosumer_id);
    const user = prosumer ? db.findUserById(prosumer.user_id) : undefined;
    const zone = db.getGridZoneById(l.grid_zone_id);
    return {
      ...l,
      prosumer: prosumer ? { ...prosumer, user } : undefined,
      grid_zone: zone,
    };
  });

  res.json({ success: true, data: populated });
});

router.post('/listings', authenticate, requireRole('prosumer'), (req: AuthRequest, res: Response) => {
  let prosumer = db.getProsumerByUserId(req.user!.id);
  if (!prosumer) {
    return res.status(404).json({ success: false, error: 'Prosumer record not found' });
  }

  const { quantity, price, start_time, end_time, date, grid_zone_id } = req.body;
  const qtyNum = Number(quantity);
  const priceNum = Number(price);
  if (!quantity || !price || !start_time || !end_time || isNaN(qtyNum) || isNaN(priceNum) || qtyNum <= 0 || priceNum <= 0) {
    return res.status(400).json({ success: false, error: 'Valid positive quantity, price, start time, and end time are required' });
  }

  const meter = db.getMeterByUserId(req.user!.id);
  const reading = meter ? db.getLatestReadingForMeter(meter.id) : undefined;
  if (reading && reading.surplus <= 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot list energy during an energy deficit (Surplus: ${reading.surplus} kWh). Deficit energy cannot be sold.`,
    });
  }

  let zoneId = 'zone_a';
  if (grid_zone_id) {
    const matched = db.getGridZoneById(grid_zone_id);
    if (matched) zoneId = matched.id;
  } else if (meter?.grid_zone_id) {
    zoneId = meter.grid_zone_id;
  }

  const newListing = db.createListing({
    prosumer_id: prosumer.id,
    quantity: qtyNum,
    price: priceNum,
    start_time,
    end_time,
    date: date || new Date().toISOString().split('T')[0],
    grid_zone_id: zoneId,
    status: 'Available',
  });

  res.json({ success: true, data: newListing });
});

router.put('/listings/:id', authenticate, requireRole('prosumer', 'admin'), (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, price, quantity } = req.body;
  const listing = db.getListingById(id);
  if (!listing) {
    return res.status(404).json({ success: false, error: 'Listing not found' });
  }

  if (status) listing.status = status;
  if (price) listing.price = Number(price);
  if (quantity) listing.quantity = Number(quantity);

  res.json({ success: true, data: listing });
});

// ----------------------------------------------------
// 4. ENERGY REQUIREMENTS & CONSUMER DASHBOARD (Sections 9 & 12.2)
// ----------------------------------------------------

router.get('/requirements', optionalAuth, (req: AuthRequest, res: Response) => {
  const consumer = req.user ? db.getConsumerByUserId(req.user.id) : db.getState().consumers[0];
  const filter = req.user?.role === 'admin' ? {} : (consumer ? { consumerId: consumer.id } : {});
  const requirements = db.getRequirements(filter);
  res.json({ success: true, data: requirements });
});

router.post('/requirements', authenticate, requireRole('consumer'), (req: AuthRequest, res: Response) => {
  const consumer = db.getConsumerByUserId(req.user!.id);
  if (!consumer) {
    return res.status(404).json({ success: false, error: 'Consumer profile not found' });
  }

  const { quantity, max_price, start_time, end_time, date, preferred_zone } = req.body;
  if (!quantity || !max_price || !start_time || !end_time) {
    return res.status(400).json({ success: false, error: 'Quantity, max price, start time, and end time are required' });
  }

  const newReq = db.createRequirement({
    consumer_id: consumer.id,
    quantity: Number(quantity),
    max_price: Number(max_price),
    start_time,
    end_time,
    date: date || new Date().toISOString().split('T')[0],
    preferred_zone: preferred_zone || 'Zone A',
    status: 'Open',
  });

  // Automatically trigger smart matching
  const matches = MatchingService.rankMatches(newReq.id);

  res.json({ success: true, data: { requirement: newReq, matches } });
});

// ----------------------------------------------------
// 5. SMART MATCHING & PRICING (Sections 14 & 16)
// ----------------------------------------------------

router.get('/matches/:requirementId', (req: Request, res: Response) => {
  const { requirementId } = req.params;
  const matches = MatchingService.rankMatches(requirementId);
  res.json({ success: true, data: matches });
});

router.get('/pricing/:listingId', (req: Request, res: Response) => {
  const { listingId } = req.params;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const breakdown = PricingService.calculatePrice(listingId, maxPrice);
  res.json({ success: true, data: breakdown });
});

// ----------------------------------------------------
// 6. TRADES & LIFECYCLE (Sections 9.4, 17, 27)
// ----------------------------------------------------

router.get('/trades', optionalAuth, (req: AuthRequest, res: Response) => {
  const user = req.user;
  let trades = db.getTrades();

  if (user?.role === 'consumer') {
    const consumer = db.getConsumerByUserId(user.id);
    if (consumer) trades = trades.filter((t) => t.buyer_id === consumer.id);
  } else if (user?.role === 'prosumer') {
    const prosumer = db.getProsumerByUserId(user.id);
    if (prosumer) trades = trades.filter((t) => t.seller_id === prosumer.id);
  }

  const populated = trades.map((t) => {
    const buyer = db.getConsumerById(t.buyer_id);
    const buyerUser = buyer ? db.findUserById(buyer.user_id) : undefined;
    const seller = db.getProsumerById(t.seller_id);
    const sellerUser = seller ? db.findUserById(seller.user_id) : undefined;
    const backupAllocations = db.getBackupAllocations(t.id);
    const backupAllocation = backupAllocations[0];
    let backupSeller = undefined;
    if (backupAllocation) {
      const bProsumer = db.getProsumerById(backupAllocation.backup_seller_id);
      const bUser = bProsumer ? db.findUserById(bProsumer.user_id) : undefined;
      backupSeller = bProsumer ? { ...bProsumer, user: bUser } : undefined;
    }
    const settlements = db.getSettlements(t.id);

    return {
      ...t,
      buyer: buyer ? { ...buyer, user: buyerUser } : undefined,
      seller: seller ? { ...seller, user: sellerUser } : undefined,
      backup_allocation: backupAllocation ? { ...backupAllocation, backup_seller: backupSeller } : undefined,
      settlements,
    };
  });

  res.json({ success: true, data: populated });
});

router.get('/trades/:id', optionalAuth, (req: Request, res: Response) => {
  const trade = db.getTradeById(req.params.id);
  if (!trade) {
    return res.status(404).json({ success: false, error: 'Trade not found' });
  }

  const buyer = db.getConsumerById(trade.buyer_id);
  const buyerUser = buyer ? db.findUserById(buyer.user_id) : undefined;
  const seller = db.getProsumerById(trade.seller_id);
  const sellerUser = seller ? db.findUserById(seller.user_id) : undefined;
  const backupAllocations = db.getBackupAllocations(trade.id);
  const settlements = db.getSettlements(trade.id);

  res.json({
    success: true,
    data: {
      ...trade,
      buyer: buyer ? { ...buyer, user: buyerUser } : undefined,
      seller: seller ? { ...seller, user: sellerUser } : undefined,
      backup_allocations: backupAllocations,
      settlements,
    },
  });
});

// Confirm trade from match (Section 17.1 & 27: Seller P001, Buyer C001, 5 kWh, ₹7.50/kWh, Total ₹37.50)
router.post('/trades/confirm', authenticate, requireRole('consumer'), (req: AuthRequest, res: Response) => {
  const { listing_id, requirement_id, quantity, price } = req.body;
  const consumer = db.getConsumerByUserId(req.user!.id);
  if (!consumer) {
    return res.status(404).json({ success: false, error: 'Consumer profile not found' });
  }

  const listing = db.getListingById(listing_id);
  if (!listing) {
    return res.status(404).json({ success: false, error: 'Listing not found' });
  }

  const tradeQty = Number(quantity) || 5.0;
  const tradePrice = Number(price) || 7.5;
  const totalAmount = parseFloat((tradeQty * tradePrice).toFixed(2));

  // Create trade with initial status 'Scheduled' per Demo Flow step 11
  const trade = db.createTrade({
    buyer_id: consumer.id,
    seller_id: listing.prosumer_id,
    listing_id: listing.id,
    requirement_id,
    quantity: tradeQty,
    price: tradePrice,
    total_amount: totalAmount,
    status: 'Scheduled',
    time_window: `${listing.start_time} - ${listing.end_time}`,
    date: listing.date,
    scheduled_time: `${listing.date} ${listing.start_time}`,
  });

  // Update listing status
  db.updateListingStatus(listing.id, 'Matched');

  // Update requirement status if applicable
  if (requirement_id) {
    db.updateRequirementStatus(requirement_id, 'Matched');
  }

  // Generate notifications
  db.createNotification({
    user_id: req.user!.id,
    type: 'trade_confirmed',
    message: `Trade #${trade.id.slice(-5)} confirmed: 5 kWh scheduled with SunPower Apex (P001) for 14:00 - 15:00 at ₹7.50/kWh.`,
  });

  const seller = db.getProsumerById(listing.prosumer_id);
  if (seller) {
    db.createNotification({
      user_id: seller.user_id,
      type: 'trade_scheduled',
      message: `New trade scheduled: 5 kWh requested by ${req.user!.name} for 14:00 - 15:00.`,
    });
  }

  res.json({ success: true, data: trade });
});

// Advance trade lifecycle status
router.post('/trades/:id/advance-status', authenticate, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const trade = db.getTradeById(id);
  if (!trade) {
    return res.status(404).json({ success: false, error: 'Trade not found' });
  }

  const updated = db.updateTrade(id, { status });
  if (status === 'Settled') {
    SettlementService.settleTrade(id);
  }

  res.json({ success: true, data: updated });
});

// Settle Trade & Simulate Meter Delivery (for instant testing/demo)
router.post('/trades/:id/simulate-delivery', optionalAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const trade = db.getTradeById(id);
  if (!trade) {
    return res.status(404).json({ success: false, error: 'Trade not found' });
  }

  const { settlements, success } = SettlementService.settleTrade(id);
  const updatedTrade = db.getTradeById(id);

  const seller = db.getProsumerById(trade.seller_id);
  const buyer = db.getConsumerById(trade.buyer_id);
  if (seller) {
    db.createNotification({
      user_id: seller.user_id,
      type: 'trade_settled',
      message: `Delivery simulated & verified: ${trade.quantity} kWh delivered. ₹${trade.total_amount.toFixed(2)} credited to your account.`,
    });
  }
  if (buyer) {
    db.createNotification({
      user_id: buyer.user_id,
      type: 'trade_settled',
      message: `Delivery simulated & verified: ${trade.quantity} kWh received from seller. Trade #${trade.id.slice(-5)} settled at ₹${trade.total_amount.toFixed(2)}.`,
    });
  }

  res.json({
    success: true,
    data: {
      trade: updatedTrade,
      settlements,
      message: `Trade #${trade.id.slice(-5)} successfully delivered & settled.`,
    },
  });
});

router.post('/trades/:id/settle', optionalAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const trade = db.getTradeById(id);
  if (!trade) {
    return res.status(404).json({ success: false, error: 'Trade not found' });
  }

  const { settlements, success } = SettlementService.settleTrade(id);
  const updatedTrade = db.getTradeById(id);

  res.json({
    success: true,
    data: {
      trade: updatedTrade,
      settlements,
      message: `Trade #${trade.id.slice(-5)} settled.`,
    },
  });
});

// ----------------------------------------------------
// 7. AUTOMATIC REBALANCING (Sections 18 & 27)
// ----------------------------------------------------

router.post('/rebalancing/:tradeId', optionalAuth, (req: Request, res: Response) => {
  const { tradeId } = req.params;
  const deliveredQty = req.body.actualDeliveredQuantity !== undefined ? Number(req.body.actualDeliveredQuantity) : 3.5;

  const result = RebalancingService.triggerRebalance(tradeId, deliveredQty);
  if (!result.trade) {
    return res.status(400).json({ success: false, error: result.message });
  }

  res.json({
    success: true,
    data: {
      trade: result.trade,
      allocation: result.allocation,
      message: result.message,
    },
  });
});

// ----------------------------------------------------
// 8. GRID ZONES (Section 15)
// ----------------------------------------------------

router.get('/grid/zones', (_req: Request, res: Response) => {
  const zones = db.getGridZones();
  res.json({ success: true, data: zones });
});

router.put('/grid/zones/:id', authenticate, requireRole('admin'), (req: Request, res: Response) => {
  const { id } = req.params;
  const { congestion_level } = req.body;
  if (!congestion_level) {
    return res.status(400).json({ success: false, error: 'congestion_level is required' });
  }

  const updated = db.updateGridZoneCongestion(id, congestion_level);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Zone not found' });
  }

  res.json({ success: true, data: updated });
});

// ----------------------------------------------------
// 9. SETTLEMENTS & COMMUNITY IMPACT (Sections 17.3, 20)
// ----------------------------------------------------

router.get('/settlements', authenticate, (req: Request, res: Response) => {
  const tradeId = req.query.tradeId ? String(req.query.tradeId) : undefined;
  const settlements = db.getSettlements(tradeId);
  res.json({ success: true, data: settlements });
});

router.get('/community/impact', (_req: Request, res: Response) => {
  const impact = db.getCommunityImpact();
  res.json({ success: true, data: impact });
});

// ----------------------------------------------------
// 10. NOTIFICATIONS (Section 19)
// ----------------------------------------------------

router.get('/notifications', optionalAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user?.id || 'usr_c001';
  const list = db.getNotificationsForUser(userId);
  res.json({ success: true, data: list });
});

router.put('/notifications/:id/read', optionalAuth, (req: Request, res: Response) => {
  const success = db.markNotificationRead(req.params.id);
  res.json({ success });
});

// ----------------------------------------------------
// 11. ADMIN DASHBOARD & CONTROL ROOM (Section 11)
// ----------------------------------------------------

router.get('/admin/dashboard', optionalAuth, (_req: Request, res: Response) => {
  const state = db.getState();
  const impact = db.getCommunityImpact();

  // Aggregate current generation vs consumption
  let liveGeneration = 0;
  let liveConsumption = 0;
  for (const meter of state.smart_meters) {
    const r = db.getLatestReadingForMeter(meter.id);
    if (r) {
      liveGeneration += r.generation;
      liveConsumption += r.consumption;
    }
  }

  const activeTrades = state.trades.filter((t) => t.status !== 'Settled' && t.status !== 'Cancelled');
  const recentRebalancing = state.backup_allocations.map((b) => {
    const trade = db.getTradeById(b.trade_id);
    const p1 = db.getProsumerById(b.primary_seller_id);
    const p2 = db.getProsumerById(b.backup_seller_id);
    const u1 = p1 ? db.findUserById(p1.user_id) : undefined;
    const u2 = p2 ? db.findUserById(p2.user_id) : undefined;
    return {
      ...b,
      trade,
      primary_seller_name: u1?.name || 'P001',
      backup_seller_name: u2?.name || 'P002',
    };
  });

  const alerts = [
    {
      id: 'alt_1',
      severity: 'amber',
      title: 'Zone C High Congestion Alert',
      detail: 'Transformer load in Zone C exceeded 84% nominal threshold.',
      timestamp: new Date().toISOString(),
    },
  ];

  if (state.backup_allocations.length > 0) {
    alerts.unshift({
      id: 'alt_rebal',
      severity: 'info',
      title: 'Auto-Rebalance Executed',
      detail: `Trade #${state.backup_allocations[0].trade_id.slice(-5)} shortfall recovered via secondary seller.`,
      timestamp: state.backup_allocations[0].created_at,
    });
  }

  res.json({
    success: true,
    data: {
      metrics: {
        live_generation_kwh: parseFloat(liveGeneration.toFixed(1)),
        live_consumption_kwh: parseFloat(liveConsumption.toFixed(1)),
        live_surplus_kwh: parseFloat((liveGeneration - liveConsumption).toFixed(1)),
        active_trades_count: activeTrades.length,
        forecast_accuracy_pct: 94.2,
        renewable_utilization_pct: 88.5,
      },
      grid_zones: state.grid_zones,
      active_trades: activeTrades,
      recent_rebalancing: recentRebalancing,
      alerts,
      impact,
    },
  });
});

router.get('/admin/users', optionalAuth, (_req: Request, res: Response) => {
  const users = db.getState().users.map((u) => {
    const { password_hash, ...safe } = u;
    const prosumer = db.getProsumerByUserId(u.id);
    const consumer = db.getConsumerByUserId(u.id);
    return {
      ...safe,
      prosumer,
      consumer,
    };
  });
  res.json({ success: true, data: users });
});

router.put('/admin/users/:id/status', optionalAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (status !== 'active' && status !== 'inactive') {
    return res.status(400).json({ success: false, error: 'Status must be active or inactive' });
  }

  const updated = db.updateUser(id, { status });
  res.json({ success: true, data: updated });
});

// Live Demo Meter Simulation trigger (PRD Section 11.3 & 28)
// Lets presenter force P001 reading down to 3.5 kWh to trigger rebalancing live during a demo!
router.post('/admin/meter/simulate', optionalAuth, (req: Request, res: Response) => {
  const { prosumerId = 'p_001', actualDelivered = 3.5, tradeId } = req.body;

  // Find active scheduled trade for this prosumer
  let targetTrade = tradeId ? db.getTradeById(tradeId) : undefined;
  if (!targetTrade) {
    targetTrade = db.getTrades().find((t) => t.seller_id === prosumerId && (t.status === 'Scheduled' || t.status === 'Confirmed' || t.status === 'Matched'));
  }

  if (!targetTrade) {
    // If no scheduled trade, let's create or find the most recent trade to demonstrate rebalancing
    const trades = db.getTrades();
    targetTrade = trades[trades.length - 1];
  }

  if (!targetTrade) {
    return res.status(400).json({ success: false, error: 'No active trade found to simulate shortfall on. Please confirm a trade first.' });
  }

  const result = RebalancingService.triggerRebalance(targetTrade.id, Number(actualDelivered));
  res.json({
    success: true,
    data: {
      trade: result.trade,
      allocation: result.allocation,
      message: result.message,
    },
  });
});

// Admin Reset Data to Pristine Seed state for repeatable demo
router.post('/admin/reset', optionalAuth, (_req: Request, res: Response) => {
  db.resetToSeed();
  res.json({ success: true, message: 'Database reset to default seed state' });
});

export default router;
