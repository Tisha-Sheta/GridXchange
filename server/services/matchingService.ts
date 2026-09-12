import { db } from '../db';
import { EnergyRequirement, EnergyListing, MatchRecord, MatchScoreReason } from '../../src/types';
import { ForecastingService } from './forecastingService';
import { PricingService } from './pricingService';
import { calculateHaversineDistanceKm } from '../../src/utils/geoUtils';

export class MatchingService {
  /**
   * Weights per PRD Section 14.2:
   * Predicted energy: 25%
   * Time compatibility: 20%
   * Price competitiveness: 20%
   * Distance / locality: 15%
   * Reliability score: 15%
   * Grid condition: 5%
   */
  public static readonly WEIGHTS = {
    predictedEnergy: 0.25,
    timeCompatibility: 0.20,
    priceCompetitiveness: 0.20,
    distanceLocality: 0.15,
    reliability: 0.15,
    gridCondition: 0.05,
  };

  public static rankMatches(requirementId: string): MatchRecord[] {
    const requirement = db.getRequirementById(requirementId);
    if (!requirement) return [];

    const consumer = db.getConsumerById(requirement.consumer_id);
    const consumerUser = consumer ? db.findUserById(consumer.user_id) : undefined;

    const availableListings = db.getListings({ status: 'Available' });
    const matches: MatchRecord[] = [];

    for (const listing of availableListings) {
      const prosumer = db.getProsumerById(listing.prosumer_id);
      const prosumerUser = prosumer ? db.findUserById(prosumer.user_id) : undefined;
      const zone = db.getGridZoneById(listing.grid_zone_id);

      // 1. Forecasting
      const forecast = prosumer
        ? ForecastingService.getForecastForProsumer(prosumer.id)
        : null;
      const predictedSurplus = forecast ? forecast.predicted_surplus : listing.quantity;

      // 2. Pricing
      const pricing = PricingService.calculatePrice(listing.id, requirement.max_price);

      // Compute Individual Factor Scores (0 - 100)
      // A. Predicted Available Energy Score
      let energyScore = 0;
      if (predictedSurplus >= requirement.quantity) {
        energyScore = 100;
      } else {
        energyScore = Math.max(20, (predictedSurplus / requirement.quantity) * 90);
      }

      // B. Time Compatibility Score
      const reqStart = requirement.start_time;
      const listStart = listing.start_time;
      const timeScore = reqStart === listStart ? 100 : 70;

      // C. Price Competitiveness Score
      // If within budget, score is higher the lower the price. If exceeding max price, penalize score so it ranks lower.
      const priceDiffRatio = (requirement.max_price - pricing.final_price) / requirement.max_price;
      const priceScore = Math.min(100, Math.max(25, Math.round(80 + priceDiffRatio * 100)));

      // D. Distance / Locality Score (15% Factor)
      // If numeric coordinates exist for both consumer & prosumer, calculate physical Haversine distance
      let localityScore = 70;
      let distanceKm: number | null = null;
      const hasConsumerCoords =
        consumerUser?.latitude !== undefined &&
        consumerUser?.longitude !== undefined &&
        !isNaN(consumerUser.latitude) &&
        !isNaN(consumerUser.longitude);
      const hasProsumerCoords =
        prosumerUser?.latitude !== undefined &&
        prosumerUser?.longitude !== undefined &&
        !isNaN(prosumerUser.latitude) &&
        !isNaN(prosumerUser.longitude);

      if (hasConsumerCoords && hasProsumerCoords) {
        distanceKm = calculateHaversineDistanceKm(
          consumerUser!.latitude!,
          consumerUser!.longitude!,
          prosumerUser!.latitude!,
          prosumerUser!.longitude!
        );

        if (distanceKm <= 2.0) {
          localityScore = 98;
        } else if (distanceKm <= 5.0) {
          localityScore = 90;
        } else if (distanceKm <= 10.0) {
          localityScore = 80;
        } else if (distanceKm <= 20.0) {
          localityScore = 65;
        } else {
          localityScore = Math.max(30, Math.round(65 - (distanceKm - 20) * 1.2));
        }
      } else {
        // Graceful fallback to zone-based proximity if coordinates are not available
        const isNearby =
          listing.grid_zone_id === 'zone_a' ||
          (requirement.preferred_zone && requirement.preferred_zone.includes(zone?.zone_name || ''));
        localityScore = isNearby ? 95 : 70;
      }

      // E. Reliability Score (from prosumer table)
      const reliabilityScore = prosumer ? prosumer.reliability_score : 80;

      // F. Grid Condition Score (5% Factor - Zone Congestion)
      let gridScore = 50;
      if (zone?.congestion_level === 'Low') gridScore = 100;
      else if (zone?.congestion_level === 'Medium') gridScore = 70;
      else gridScore = 30;

      // Weighted Composite Score (0 - 100)
      const rawScore =
        energyScore * this.WEIGHTS.predictedEnergy +
        timeScore * this.WEIGHTS.timeCompatibility +
        priceScore * this.WEIGHTS.priceCompetitiveness +
        localityScore * this.WEIGHTS.distanceLocality +
        reliabilityScore * this.WEIGHTS.reliability +
        gridScore * this.WEIGHTS.gridCondition;

      const finalScore = Math.min(99, Math.max(50, Math.round(rawScore)));

      // Explainable Reason Checklist (Section 14.3)
      const localityDetail =
        distanceKm !== null
          ? `${distanceKm} km away (${prosumerUser?.locality || prosumerUser?.city || 'Nearby'})`
          : `${prosumerUser?.location || 'Zone ' + (zone?.zone_name || 'A')}`;

      const reasons: MatchScoreReason[] = [
        {
          label: 'Enough predicted energy',
          passed: predictedSurplus >= requirement.quantity,
          detail: `${predictedSurplus} kWh forecast vs ${requirement.quantity} kWh needed`,
        },
        {
          label: 'Time compatible',
          passed: timeScore >= 80,
          detail: `Window: ${listing.start_time} - ${listing.end_time}`,
        },
        {
          label: 'Nearby',
          passed: localityScore >= 75,
          detail: localityDetail,
        },
        {
          label: 'Competitive price',
          passed: pricing.final_price <= requirement.max_price,
          detail: `₹${pricing.final_price}/kWh within budget (max ₹${requirement.max_price}/kWh)`,
        },
        {
          label: 'High reliability',
          passed: reliabilityScore >= 85,
          detail: `${reliabilityScore}% historical fulfillment reliability`,
        },
        {
          label: 'Low grid congestion',
          passed: zone?.congestion_level === 'Low',
          detail: `Zone ${zone?.zone_name || 'A'} (${zone?.congestion_level || 'Low'} congestion)`,
        },
      ];

      const fullProsumer = prosumer ? { ...prosumer, user: prosumerUser } : undefined;

      matches.push({
        id: `mtc_${requirementId}_${listing.id}`,
        requirement_id: requirementId,
        listing_id: listing.id,
        match_score: finalScore,
        reasons,
        pricing_breakdown: pricing,
        created_at: new Date().toISOString(),
        listing: {
          ...listing,
          grid_zone: zone,
        },
        prosumer: fullProsumer,
      });
    }

    // Sort by highest match score descending
    matches.sort((a, b) => b.match_score - a.match_score);

    // Persist matches for auditability (Section 14.4)
    db.setMatchesForRequirement(requirementId, matches);

    return matches;
  }
}
