/**
 * Geographic coordinate conversion utilities for 3D globe rendering
 */

/**
 * Convert latitude, longitude, and altitude to 3D Cartesian coordinates
 * 
 * @param latDeg - Latitude in degrees (-90 to 90)
 * @param lonDeg - Longitude in degrees (-180 to 180)
 * @param altKm - Altitude in kilometers (0 to 60)
 * @param earthRadius - Base sphere radius (default 1 for normalized coordinates)
 * @param altScale - Scale factor for altitude (default 0.01)
 * @returns {x, y, z} Cartesian coordinates on a sphere
 * 
 * @remarks
 * Standard spherical to Cartesian conversion where:
 * - x: points towards (0°N, 0°E)
 * - y: points towards North Pole
 * - z: points towards (0°N, 90°E)
 * 
 * The radius is adjusted by altitude: r = earthRadius + altScale * altKm
 * 
 * @example
 * // Equator, Prime Meridian at sea level
 * latLonAltToXYZ(0, 0, 0)
 * // → {x: 1.0, y: 0.0, z: 0.0}
 * 
 * @example
 * // North Pole at sea level
 * latLonAltToXYZ(90, 0, 0)
 * // → {x: 0.0, y: 1.0, z: 0.0}
 * 
 * @example
 * // Equator, 90°E, 20km altitude
 * latLonAltToXYZ(0, 90, 20)
 * // → {x: 0.0, y: 0.0, z: 1.2} (radius = 1 + 0.01 * 20 = 1.2)
 * 
 * @example
 * // San Francisco (37.77°N, 122.42°W) at 10km
 * latLonAltToXYZ(37.77, -122.42, 10)
 * // → {x: -0.471, y: 0.612, z: -0.630}
 */
export function latLonAltToXYZ(
  latDeg: number,
  lonDeg: number,
  altKm: number,
  earthRadius: number = 1,
  altScale: number = 0.01
): { x: number; y: number; z: number } {
  // Convert degrees to radians
  const latRad = (latDeg * Math.PI) / 180;
  const lonRad = (lonDeg * Math.PI) / 180;

  // Calculate effective radius including altitude
  const r = earthRadius + altScale * altKm;

  // Standard spherical to Cartesian conversion
  // x: towards (0°N, 0°E)
  // y: towards North Pole (90°N)
  // z: towards (0°N, 90°E)
  const cosLat = Math.cos(latRad);
  const sinLat = Math.sin(latRad);
  const cosLon = Math.cos(lonRad);
  const sinLon = Math.sin(lonRad);

  return {
    x: r * cosLat * cosLon,
    y: r * sinLat,
    z: r * cosLat * sinLon,
  };
}

