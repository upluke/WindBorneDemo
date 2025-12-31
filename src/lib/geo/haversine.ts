/**
 * Haversine distance calculation for geographic coordinates
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculate the great-circle distance between two points on Earth
 * using the Haversine formula
 * 
 * @param lat1 - Latitude of first point in degrees
 * @param lon1 - Longitude of first point in degrees
 * @param lat2 - Latitude of second point in degrees
 * @param lon2 - Longitude of second point in degrees
 * @returns Distance in kilometers
 * 
 * @remarks
 * The Haversine formula provides accurate distance calculations for points
 * not antipodal (directly opposite on the sphere). Accuracy is sufficient
 * for balloon tracking purposes.
 * 
 * @example
 * // Distance between San Francisco and New York
 * haversine(37.77, -122.42, 40.71, -74.01)
 * // → ~4138 km
 * 
 * @example
 * // Distance between nearby points (same city)
 * haversine(37.77, -122.42, 37.78, -122.41)
 * // → ~1.4 km
 */
export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Convert degrees to radians
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  // Haversine formula
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in kilometers
  return EARTH_RADIUS_KM * c;
}

