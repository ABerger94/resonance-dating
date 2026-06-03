const DEFAULT_MATCH_RADIUS_MILES = 50;
const MIN_MATCH_RADIUS_MILES = 1;
const MAX_MATCH_RADIUS_MILES = 500;

const CITY_COORDINATES = {
  'new york, ny': { latitude: 40.7128, longitude: -74.0060 },
  'brooklyn, ny': { latitude: 40.6782, longitude: -73.9442 },
  'queens, ny': { latitude: 40.7282, longitude: -73.7949 },
  'jersey city, nj': { latitude: 40.7178, longitude: -74.0431 },
  'hoboken, nj': { latitude: 40.74399, longitude: -74.03236 },
  'philadelphia, pa': { latitude: 39.9526, longitude: -75.1652 },
  'boston, ma': { latitude: 42.3601, longitude: -71.0589 },
  'washington, dc': { latitude: 38.9072, longitude: -77.0369 },
  'los angeles, ca': { latitude: 34.0522, longitude: -118.2437 },
  'san francisco, ca': { latitude: 37.7749, longitude: -122.4194 },
  'chicago, il': { latitude: 41.8781, longitude: -87.6298 },
  'austin, tx': { latitude: 30.2672, longitude: -97.7431 },
  'miami, fl': { latitude: 25.7617, longitude: -80.1918 },
  'seattle, wa': { latitude: 47.6062, longitude: -122.3321 },
  'denver, co': { latitude: 39.7392, longitude: -104.9903 }
};

export function clampMatchRadiusMiles(value) {
  const radius = Number(value);
  if (!Number.isFinite(radius)) return DEFAULT_MATCH_RADIUS_MILES;
  return Math.max(MIN_MATCH_RADIUS_MILES, Math.min(MAX_MATCH_RADIUS_MILES, Math.round(radius)));
}

export function normalizeLocationKey(location) {
  return String(location || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function resolveCoordinates(profileOrLocation) {
  if (!profileOrLocation) return null;
  if (typeof profileOrLocation === 'object') {
    const latitude = Number(profileOrLocation.latitude);
    const longitude = Number(profileOrLocation.longitude);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return { latitude, longitude };
    }
    return resolveCoordinates(profileOrLocation.location);
  }

  const location = String(profileOrLocation).trim();
  const coordinateMatch = location.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (coordinateMatch) {
    const latitude = Number(coordinateMatch[1]);
    const longitude = Number(coordinateMatch[2]);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return { latitude, longitude };
    }
  }

  return CITY_COORDINATES[normalizeLocationKey(location)] || null;
}

export function distanceMiles(origin, destination) {
  const start = resolveCoordinates(origin);
  const end = resolveCoordinates(destination);
  if (!start || !end) return null;

  const earthRadiusMiles = 3958.8;
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const dLat = toRadians(end.latitude - start.latitude);
  const dLon = toRadians(end.longitude - start.longitude);
  const lat1 = toRadians(start.latitude);
  const lat2 = toRadians(end.latitude);

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isWithinMatchRadius(viewerProfile, candidateProfile) {
  const viewerCoordinates = resolveCoordinates(viewerProfile);
  if (!viewerCoordinates) return true;
  const candidateCoordinates = resolveCoordinates(candidateProfile);
  if (!candidateCoordinates) return false;
  const radius = clampMatchRadiusMiles(viewerProfile.match_radius_miles);
  const distance = distanceMiles(viewerCoordinates, candidateCoordinates);
  return distance !== null && distance <= radius;
}

export { DEFAULT_MATCH_RADIUS_MILES, MAX_MATCH_RADIUS_MILES, MIN_MATCH_RADIUS_MILES };
