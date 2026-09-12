import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  X,
  Search,
  MapPin,
  Crosshair,
  Check,
  Loader2,
  Navigation,
  Sparkles,
} from 'lucide-react';
import {
  DEFAULT_MAP_CENTER,
  assignGridZoneFromCoords,
  formatLocationString,
  GridZoneAssignment,
} from '../utils/geoUtils';

export interface LocationSelectionResult {
  city: string;
  locality: string;
  latitude: number;
  longitude: number;
  location: string;
  grid_zone: 'Zone A' | 'Zone B' | 'Zone C';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (result: LocationSelectionResult) => void;
  initialCoords?: { latitude: number; longitude: number };
  initialLocationName?: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    suburb?: string;
    neighbourhood?: string;
    residential?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state_district?: string;
    county?: string;
    state?: string;
  };
}

// Popular demo locations for instant 1-click selection
const DEMO_PRESETS = [
  { name: 'Vastrapur, Ahmedabad', lat: 23.0350, lng: 72.5293, locality: 'Vastrapur', city: 'Ahmedabad' },
  { name: 'Bodakdev, Ahmedabad', lat: 23.0384, lng: 72.5122, locality: 'Bodakdev', city: 'Ahmedabad' },
  { name: 'Navrangpura, Ahmedabad', lat: 23.0373, lng: 72.5613, locality: 'Navrangpura', city: 'Ahmedabad' },
  { name: 'Prahlad Nagar, Ahmedabad', lat: 23.0125, lng: 72.5090, locality: 'Prahlad Nagar', city: 'Ahmedabad' },
  { name: 'Changodar Industrial, Ahmedabad', lat: 22.9200, lng: 72.4350, locality: 'Changodar', city: 'Ahmedabad' },
];

export const LocationPickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  initialCoords,
  initialLocationName,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>(() => ({
    lat: initialCoords?.latitude || DEFAULT_MAP_CENTER.lat,
    lng: initialCoords?.longitude || DEFAULT_MAP_CENTER.lng,
  }));

  const [locality, setLocality] = useState<string>('');
  const [city, setCity] = useState<string>('Ahmedabad');
  const [locationName, setLocationName] = useState<string>(initialLocationName || 'Vastrapur, Ahmedabad');
  const [gridZone, setGridZone] = useState<GridZoneAssignment>(() =>
    assignGridZoneFromCoords(
      initialCoords?.latitude || DEFAULT_MAP_CENTER.lat,
      initialCoords?.longitude || DEFAULT_MAP_CENTER.lng
    )
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);

  // Custom Modern DivIcon for Pin (Pulsing Amber/Emerald Ring)
  const createCustomIcon = () => {
    return L.divIcon({
      className: 'custom-gridxchange-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; transform: translate(-50%, -100%);">
          <div style="position: absolute; width: 36px; height: 36px; background: rgba(229, 169, 60, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 28px; height: 28px; background: #E5A93C; border: 2.5px solid #FFFFFF; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="width: 8px; height: 8px; background: #1A1B19; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });
  };

  // Extract locality and city from Nominatim Address object
  const extractAddressDetails = (address: any, displayName?: string) => {
    let resolvedCity =
      address?.city ||
      address?.town ||
      address?.village ||
      address?.municipality ||
      address?.state_district ||
      address?.county ||
      'Ahmedabad';

    let resolvedLocality =
      address?.suburb ||
      address?.neighbourhood ||
      address?.residential ||
      address?.road ||
      address?.quarter ||
      address?.hamlet ||
      address?.city_district ||
      '';

    if (!resolvedLocality && displayName) {
      const parts = displayName.split(',').map((p) => p.trim());
      resolvedLocality = parts[0] || '';
      if (!resolvedCity && parts.length > 1) {
        resolvedCity = parts[1] || '';
      }
    }

    return { resolvedLocality, resolvedCity };
  };

  // Perform Reverse Geocoding ONLY when selection is finalized (on click / dragend / preset pick)
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
        },
      });
      if (res.ok) {
        const data = await res.json();
        const { resolvedLocality, resolvedCity } = extractAddressDetails(data.address, data.display_name);
        const cleanLocality = resolvedLocality || locality || 'Vastrapur';
        const cleanCity = resolvedCity || city || 'Ahmedabad';

        setLocality(cleanLocality);
        setCity(cleanCity);
        const formatted = formatLocationString(cleanLocality, cleanCity);
        setLocationName(formatted);
      }
    } catch (err) {
      console.warn('Reverse geocoding error (using fallback):', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Update coordinate and auto-assigned grid zone
  const updateLocationPoint = (lat: number, lng: number, triggerReverse = true) => {
    const numericLat = parseFloat(lat.toFixed(6));
    const numericLng = parseFloat(lng.toFixed(6));
    setSelectedCoords({ lat: numericLat, lng: numericLng });

    const assignedZone = assignGridZoneFromCoords(numericLat, numericLng);
    setGridZone(assignedZone);

    if (markerRef.current) {
      markerRef.current.setLatLng([numericLat, numericLng]);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([numericLat, numericLng]);
    }

    if (triggerReverse) {
      reverseGeocode(numericLat, numericLng);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedCoords.lat, selectedCoords.lng],
        zoom: DEFAULT_MAP_CENTER.zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create Draggable Pin Marker
      const marker = L.marker([selectedCoords.lat, selectedCoords.lng], {
        icon: createCustomIcon(),
        draggable: true,
      }).addTo(map);

      // Reverse geocode ONLY when drag completes (dragend), never during dragging!
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updateLocationPoint(pos.lat, pos.lng, true);
      });

      // Click on Map to Drop/Move Pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        updateLocationPoint(e.latlng.lat, e.latlng.lng, true);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    // Invalidate size to ensure crisp rendering inside modal
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Clean up map when modal unmounts
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Search Address with Nominatim Geocoder
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowResultsDropdown(true);

    try {
      const query = encodeURIComponent(searchQuery.trim());
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5&countrycodes=in`;
      const res = await fetch(url);
      if (res.ok) {
        const data: SearchResult[] = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error('Search geocoding error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const { resolvedLocality, resolvedCity } = extractAddressDetails(result.address, result.display_name);

    setLocality(resolvedLocality);
    setCity(resolvedCity);
    const formatted = formatLocationString(resolvedLocality, resolvedCity);
    setLocationName(formatted);

    updateLocationPoint(lat, lng, false);
    setShowResultsDropdown(false);
    setSearchQuery('');
  };

  const handleSelectPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setLocality(preset.locality);
    setCity(preset.city);
    setLocationName(preset.name);
    updateLocationPoint(preset.lat, preset.lng, false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingUser(false);
        updateLocationPoint(pos.coords.latitude, pos.coords.longitude, true);
      },
      (err) => {
        setIsLocatingUser(false);
        console.warn('Geolocation failed:', err.message);
        alert('Could not access current location. Please select on map or use search.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleConfirm = () => {
    const formattedLocation = formatLocationString(locality, city) || locationName;
    onConfirm({
      city: city || 'Ahmedabad',
      locality: locality || 'Vastrapur',
      latitude: selectedCoords.lat,
      longitude: selectedCoords.lng,
      location: formattedLocation,
      grid_zone: gridZone.name,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-[#0F100E]/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#1A1B19] dark:text-[#EDEDE8]">
        {/* Header */}
        <div className="p-5 border-b border-[#EFECE4] dark:border-[#262723] flex items-center justify-between bg-[#FAF8F5] dark:bg-[#141513]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] dark:bg-[#2A2312] text-[#B45309] dark:text-[#E5A93C] flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-[#1A1B19] dark:text-[#EDEDE8]">
                Select Your Grid Location
              </h3>
              <p className="text-xs text-[#686B63] dark:text-[#8D9188]">
                Search your area or click on the map to pin your rooftop/facility
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#EFECE4] dark:hover:bg-[#20211E] text-[#8D9188] hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Shortcuts Bar */}
        <div className="p-4 border-b border-[#EFECE4] dark:border-[#262723] bg-[#FFFFFF] dark:bg-[#171816] space-y-3">
          <div className="relative">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8D9188] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search area, society, landmark, or street..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#111210] text-xs sm:text-sm text-[#1A1B19] dark:text-[#EDEDE8] focus:outline-none focus:border-[#B45309]"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2.5 rounded-2xl bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Search</span>
              </button>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocatingUser}
                title="Use Current GPS Location"
                className="px-3.5 py-2.5 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] hover:bg-[#FAF8F5] dark:hover:bg-[#1F201C] text-[#1A1B19] dark:text-[#EDEDE8] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {isLocatingUser ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Crosshair className="w-3.5 h-3.5 text-[#B45309] dark:text-[#E5A93C]" />
                )}
                <span className="hidden sm:inline">GPS</span>
              </button>
            </form>

            {/* Search Results Dropdown */}
            {showResultsDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#FFFFFF] dark:bg-[#1A1B18] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-2xl shadow-xl z-70 overflow-hidden max-h-48 overflow-y-auto">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#FAF8F5] dark:hover:bg-[#232420] text-xs border-b border-[#EFECE4] dark:border-[#262723] last:border-b-0 flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#E5A93C] shrink-0 mt-0.5" />
                    <span className="truncate text-[#1A1B19] dark:text-[#EDEDE8]">{res.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Demo Area Shortcuts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            <span className="text-[#8D9188] font-mono shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#E5A93C]" />
              Quick:
            </span>
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="px-2.5 py-1 rounded-full border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#1A1B18] hover:border-[#B45309] dark:hover:border-[#E5A93C] text-[#686B63] dark:text-[#9EA299] hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] shrink-0 transition-colors cursor-pointer font-medium"
              >
                {p.locality}
              </button>
            ))}
          </div>
        </div>

        {/* Map View */}
        <div className="relative flex-1 min-h-[280px] sm:min-h-[340px] bg-[#EFECE4] dark:bg-[#111210]">
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '280px' }} />

          {/* Floating Instructions Helper Badge */}
          <div className="absolute top-3 left-3 z-40 bg-[#FFFFFF]/90 dark:bg-[#171816]/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[#E6E2D8] dark:border-[#2C2D29] text-[11px] font-medium text-[#686B63] dark:text-[#9EA299] shadow-sm flex items-center gap-1.5 pointer-events-none">
            <MapPin className="w-3 h-3 text-[#B45309] dark:text-[#E5A93C]" />
            <span>Click map or drag pin to position</span>
          </div>

          {/* Loading indicator when resolving address */}
          {isGeocoding && (
            <div className="absolute top-3 right-3 z-40 bg-[#FFFFFF]/95 dark:bg-[#171816]/95 px-3 py-1.5 rounded-full border border-[#E6E2D8] dark:border-[#2C2D29] text-[11px] font-mono text-[#B45309] dark:text-[#E5A93C] shadow-sm flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Resolving address...</span>
            </div>
          )}
        </div>

        {/* Footer: Resolved Location Card & Confirm Button */}
        <div className="p-4 sm:p-5 border-t border-[#EFECE4] dark:border-[#262723] bg-[#FAF8F5] dark:bg-[#141513] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8D9188] mb-0.5">
              Confirmed Location
            </div>
            <div className="flex items-center gap-2">
              <div className="font-heading font-bold text-sm sm:text-base text-[#1A1B19] dark:text-[#EDEDE8]">
                {locationName || `${locality}, ${city}`}
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#E8F2EC] dark:bg-[#1B2920] text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/20">
                {gridZone.name}
              </span>
            </div>
            <div className="text-[11px] text-[#686B63] dark:text-[#8D9188] mt-0.5">
              Auto-assigned feeder: <span className="font-medium">{gridZone.description}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-full border border-[#E6E2D8] dark:border-[#2C2D29] text-xs font-bold text-[#686B63] dark:text-[#9EA299] hover:bg-[#EFECE4] dark:hover:bg-[#20211E] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
