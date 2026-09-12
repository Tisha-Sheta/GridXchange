/**
 * Geographic utilities for GridXchange.
 * Handles distance calculation (Haversine) and deterministic grid zone assignment
 * for the supported demo geography with robust fallback.
 */

export interface GridZoneAssignment {
  id: 'zone_a' | 'zone_b' | 'zone_c';
  name: 'Zone A' | 'Zone B' | 'Zone C';
  description: string;
}

/**
 * Calculates Haversine distance in kilometers between two coordinates.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Supported Demo Geography: Ahmedabad Urban Energy Grid
 * - Zone A: Western Solar Corridor (Vastrapur, Bodakdev, SG Highway, Satellite, Thaltej, Prahlad Nagar)
 * - Zone B: Central Commercial Grid (Navrangpura, CG Road, Ashram Road, Paldi, Usmanpura)
 * - Zone C: Eastern Industrial Microgrid (Naroda, Odhav, Vatva, Changodar, Nikol, Maninagar)
 *
 * Secondary Demo Support: Pune Energy Grid
 * - Zone A: West Suburbs (Baner, Aundh, Kothrud, Kalyani Nagar)
 * - Zone B: Central Hub (Shivajinagar, Koregaon Park, Viman Nagar)
 * - Zone C: East Industrial (Hadapsar, Magarpatta, Kharadi)
 *
 * Clear Fallback: Zone A (Primary Grid Feeder) for any coordinates outside supported demo areas.
 */
export function assignGridZoneFromCoords(lat: number, lng: number): GridZoneAssignment {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return {
      id: 'zone_a',
      name: 'Zone A',
      description: 'Default Primary Feeder (Zone A)',
    };
  }

  // 1. Check Ahmedabad Demo Area (Lat ~22.85 to 23.25, Lng ~72.35 to 72.75)
  if (lat >= 22.85 && lat <= 23.25 && lng >= 72.35 && lng <= 72.75) {
    if (lng <= 72.54) {
      return {
        id: 'zone_a',
        name: 'Zone A',
        description: 'Western Solar Feeder (Zone A)',
      };
    } else if (lng <= 72.59) {
      return {
        id: 'zone_b',
        name: 'Zone B',
        description: 'Central Commercial Grid (Zone B)',
      };
    } else {
      return {
        id: 'zone_c',
        name: 'Zone C',
        description: 'Eastern Industrial Microgrid (Zone C)',
      };
    }
  }

  // 2. Check Pune Demo Area (Lat ~18.35 to 18.75, Lng ~73.65 to 74.05)
  if (lat >= 18.35 && lat <= 18.75 && lng >= 73.65 && lng <= 74.05) {
    if (lng <= 73.85) {
      return {
        id: 'zone_a',
        name: 'Zone A',
        description: 'West Suburbs Feeder (Zone A)',
      };
    } else if (lng <= 73.92) {
      return {
        id: 'zone_b',
        name: 'Zone B',
        description: 'Central Distribution (Zone B)',
      };
    } else {
      return {
        id: 'zone_c',
        name: 'Zone C',
        description: 'East Microgrid (Zone C)',
      };
    }
  }

  // 3. Clear Fallback for outside demo regions: Zone A
  return {
    id: 'zone_a',
    name: 'Zone A',
    description: 'Regional Main Feeder (Zone A Fallback)',
  };
}

/**
 * Formats user-facing location string as "Locality, City" or "City".
 */
export function formatLocationString(locality?: string, city?: string): string {
  const cleanLoc = locality ? locality.trim() : '';
  const cleanCity = city ? city.trim() : '';

  if (cleanLoc && cleanCity) {
    if (cleanLoc.toLowerCase().includes(cleanCity.toLowerCase())) {
      return cleanLoc;
    }
    return `${cleanLoc}, ${cleanCity}`;
  }
  return cleanLoc || cleanCity || 'Location Not Set';
}

export const DEFAULT_MAP_CENTER = {
  lat: 23.0350,
  lng: 72.5293,
  zoom: 13,
};
