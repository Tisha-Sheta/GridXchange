import { db } from '../db';
import { Settlement } from '../../src/types';

export class SettlementService {
  /**
   * Settles a trade. If the trade was rebalanced, splits payments
   * across primary and backup sellers according to actual delivered quantities.
   */
  public static settleTrade(tradeId: string): { settlements: Settlement[]; success: boolean } {
    const trade = db.getTradeById(tradeId);
    if (!trade) return { settlements: [], success: false };

    const backupAllocations = db.getBackupAllocations(tradeId);
    const settlements: Settlement[] = [];

    if (backupAllocations.length > 0) {
      // Trade was rebalanced
      const allocation = backupAllocations[0];
      const primaryQty = allocation.primary_actual_quantity;
      const backupQty = allocation.shortfall_quantity;

      const primaryEarnings = parseFloat((primaryQty * trade.price).toFixed(2));
      const backupEarnings = parseFloat((backupQty * trade.price).toFixed(2));
      const totalBuyerAmount = parseFloat(((primaryQty + backupQty) * trade.price).toFixed(2));

      // 1. Settlement for Primary Seller
      const primarySettlement = db.createSettlement({
        trade_id: trade.id,
        seller_id: allocation.primary_seller_id,
        actual_quantity: primaryQty,
        seller_amount: primaryEarnings,
        buyer_amount: primaryEarnings,
        settlement_status: 'Completed',
      });
      settlements.push(primarySettlement);

      // 2. Settlement for Backup Seller
      const backupSettlement = db.createSettlement({
        trade_id: trade.id,
        seller_id: allocation.backup_seller_id,
        actual_quantity: backupQty,
        seller_amount: backupEarnings,
        buyer_amount: backupEarnings,
        settlement_status: 'Completed',
      });
      settlements.push(backupSettlement);

      // Update prosumers earnings & energy sold
      const p1 = db.getProsumerById(allocation.primary_seller_id);
      if (p1) {
        p1.total_energy_sold = parseFloat((p1.total_energy_sold + primaryQty).toFixed(1));
        p1.total_earnings = parseFloat((p1.total_earnings + primaryEarnings).toFixed(2));
        // Small reliability adjustment for shortfall
        p1.reliability_score = Math.max(70, p1.reliability_score - 1);
      }

      const p2 = db.getProsumerById(allocation.backup_seller_id);
      if (p2) {
        p2.total_energy_sold = parseFloat((p2.total_energy_sold + backupQty).toFixed(1));
        p2.total_earnings = parseFloat((p2.total_earnings + backupEarnings).toFixed(2));
      }

      // Update consumer savings & energy
      const consumer = db.getConsumerById(trade.buyer_id);
      if (consumer) {
        const totalDelivered = primaryQty + backupQty;
        consumer.total_energy_purchased = parseFloat((consumer.total_energy_purchased + totalDelivered).toFixed(1));
        // Savings = Benchmark grid price (₹10/kWh) - trade price
        const savingsPerKwh = Math.max(0, 10.0 - trade.price);
        consumer.total_savings = parseFloat((consumer.total_savings + totalDelivered * savingsPerKwh).toFixed(2));
      }

      trade.status = 'Settled';
      db.updateTrade(trade.id, { status: 'Settled' });
    } else {
      // Standard non-rebalanced settlement
      const amount = parseFloat((trade.quantity * trade.price).toFixed(2));
      const settlement = db.createSettlement({
        trade_id: trade.id,
        seller_id: trade.seller_id,
        actual_quantity: trade.quantity,
        seller_amount: amount,
        buyer_amount: amount,
        settlement_status: 'Completed',
      });
      settlements.push(settlement);

      const seller = db.getProsumerById(trade.seller_id);
      if (seller) {
        seller.total_energy_sold = parseFloat((seller.total_energy_sold + trade.quantity).toFixed(1));
        seller.total_earnings = parseFloat((seller.total_earnings + amount).toFixed(2));
      }

      const consumer = db.getConsumerById(trade.buyer_id);
      if (consumer) {
        consumer.total_energy_purchased = parseFloat((consumer.total_energy_purchased + trade.quantity).toFixed(1));
        const savingsPerKwh = Math.max(0, 10.0 - trade.price);
        consumer.total_savings = parseFloat((consumer.total_savings + trade.quantity * savingsPerKwh).toFixed(2));
      }

      trade.status = 'Settled';
      db.updateTrade(trade.id, { status: 'Settled' });
    }

    return { settlements, success: true };
  }
}
