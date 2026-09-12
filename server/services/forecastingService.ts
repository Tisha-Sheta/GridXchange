import { db } from '../db';
import { ForecastRecord } from '../../src/types';

export class ForecastingService {
  /**
   * Computes near-term forecast for a prosumer for a given target hour.
   * Reproduces Section 13.2 & 28 specifications:
   * P001 at 14:00 (2-3 PM): 5.8 kWh surplus.
   */
  public static getForecastForProsumer(prosumerId: string, targetHour = 14): ForecastRecord {
    // Check if a pre-computed forecast exists in DB
    const existing = db.getForecastForProsumer(prosumerId);
    if (existing) {
      return existing;
    }

    const prosumer = db.getProsumerById(prosumerId);
    const capacity = prosumer ? Math.max(0, prosumer.solar_capacity) : 8.0;

    // Solar irradiance curve model peaking at 12:00 - 14:00
    let solarFraction = 0.8;
    if (targetHour >= 11 && targetHour <= 13) solarFraction = 0.95;
    else if (targetHour === 14) solarFraction = 0.88;
    else if (targetHour === 15) solarFraction = 0.78;
    else if (targetHour >= 16) solarFraction = 0.55;

    const predictedGeneration = Math.max(0, Math.min(capacity, parseFloat((capacity * solarFraction).toFixed(1))));
    const predictedConsumption = Math.max(0, parseFloat((capacity * 0.3).toFixed(1)));
    const predictedSurplus = parseFloat((predictedGeneration - predictedConsumption).toFixed(1));

    const today = new Date().toISOString().split('T')[0];
    const forecast: ForecastRecord = {
      id: `fc_${prosumerId}_${targetHour}`,
      prosumer_id: prosumerId,
      predicted_generation: predictedGeneration,
      predicted_consumption: predictedConsumption,
      predicted_surplus: predictedSurplus,
      confidence_score: 92,
      prediction_time: `${today}T${String(targetHour).padStart(2, '0')}:00:00.000Z`,
    };

    return db.setForecast(forecast);
  }

  /**
   * Returns hourly forecast series for charting (Forecast vs Actual)
   */
  public static getHourlyForecastSeries(prosumerId: string) {
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    const prosumer = db.getProsumerById(prosumerId);
    const meter = prosumer ? db.getMeterByUserId(prosumer.user_id) : undefined;
    const readings = meter ? db.getReadingsForMeter(meter.id) : [];
    const capacity = prosumer ? Math.max(0, prosumer.solar_capacity) : 6.0;

    return hours.map((h) => {
      const timeLabel = `${String(h).padStart(2, '0')}:00`;
      const reading = readings.find((r) => r.timestamp.includes(`T${String(h).padStart(2, '0')}`));
      
      // Hourly solar profile
      let solarFrac = 0.75;
      if (h === 8) solarFrac = 0.20;
      else if (h === 9) solarFrac = 0.40;
      else if (h === 10) solarFrac = 0.63;
      else if (h === 11) solarFrac = 0.82;
      else if (h === 12) solarFrac = 0.96;
      else if (h === 13) solarFrac = 0.93;
      else if (h === 14) solarFrac = 0.88;
      else if (h === 15) solarFrac = 0.75;
      else if (h === 16) solarFrac = 0.52;
      else if (h === 17) solarFrac = 0.30;

      const predictedGen = Math.max(0, Math.min(capacity, parseFloat((capacity * solarFrac).toFixed(1))));
      const predictedCons = Math.max(0, parseFloat((capacity * 0.3).toFixed(1)));
      const predictedSurplus = parseFloat((predictedGen - predictedCons).toFixed(1));

      return {
        hour: timeLabel,
        predictedGeneration: predictedGen,
        predictedSurplus: predictedSurplus,
        actualGeneration: reading ? reading.generation : null,
        actualSurplus: reading ? reading.surplus : null,
      };
    });
  }
}
