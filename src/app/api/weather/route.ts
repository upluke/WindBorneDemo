import { NextRequest, NextResponse } from 'next/server';

/**
 * Weather data response structure
 */
interface WeatherResponse {
  lat: number;
  lon: number;
  fetchedAt: string;
  current: {
    tempC: number;
    windKph: number;
    windDirDeg: number;
  };
  error?: string;
}

/**
 * Cache entry for weather data
 */
interface CacheEntry {
  ts: number;
  data: WeatherResponse;
}

// In-memory cache with TTL
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Round coordinate to specified precision for cache key
 * @param coord - Latitude or longitude
 * @param precision - Rounding precision (default 0.25 degrees)
 */
function roundCoord(coord: number, precision: number = 0.25): number {
  return Math.round(coord / precision) * precision;
}

/**
 * Generate cache key from rounded coordinates
 */
function getCacheKey(lat: number, lon: number): string {
  const roundedLat = roundCoord(lat);
  const roundedLon = roundCoord(lon);
  return `${roundedLat},${roundedLon}`;
}

/**
 * Fetch weather data from Open-Meteo API
 * 
 * @param lat - Latitude (-90 to 90)
 * @param lon - Longitude (-180 to 180)
 * @returns Weather data with temperature and wind information
 * 
 * @remarks
 * Uses Open-Meteo's free forecast API to get current weather conditions:
 * - temperature_2m: Temperature at 2 meters above ground (°C)
 * - wind_speed_10m: Wind speed at 10 meters (km/h)
 * - wind_direction_10m: Wind direction (degrees)
 */
async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toString());
  url.searchParams.set('longitude', lon.toString());
  url.searchParams.set('current', 'temperature_2m,wind_speed_10m,wind_direction_10m');
  url.searchParams.set('temperature_unit', 'celsius');
  url.searchParams.set('wind_speed_unit', 'kmh');

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 0 }, // No Next.js caching
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract current weather data
    const current = data.current;
    if (!current) {
      throw new Error('No current weather data available');
    }

    return {
      lat,
      lon,
      fetchedAt: new Date().toISOString(),
      current: {
        tempC: current.temperature_2m ?? 0,
        windKph: current.wind_speed_10m ?? 0,
        windDirDeg: current.wind_direction_10m ?? 0,
      },
    };
  } catch (error) {
    // Return error in response structure (don't throw)
    return {
      lat,
      lon,
      fetchedAt: new Date().toISOString(),
      current: {
        tempC: 0,
        windKph: 0,
        windDirDeg: 0,
      },
      error: error instanceof Error ? error.message : 'Failed to fetch weather',
    };
  }
}

/**
 * GET /api/weather?lat=...&lon=...
 * 
 * Fetch current weather conditions for a geographic location
 * 
 * @remarks
 * - Validates lat ∈ [-90, 90] and lon ∈ [-180, 180]
 * - Uses 60-second cache with 0.25° precision
 * - Never throws; returns error in response with 200 status
 * - Data sourced from Open-Meteo free API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');

    // Validate required parameters
    if (!latStr || !lonStr) {
      return NextResponse.json({
        lat: 0,
        lon: 0,
        fetchedAt: new Date().toISOString(),
        current: { tempC: 0, windKph: 0, windDirDeg: 0 },
        error: 'Missing required parameters: lat and lon',
      });
    }

    // Parse and validate coordinates
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({
        lat: 0,
        lon: 0,
        fetchedAt: new Date().toISOString(),
        current: { tempC: 0, windKph: 0, windDirDeg: 0 },
        error: 'Invalid coordinates: lat and lon must be numbers',
      });
    }

    // Validate ranges
    if (lat < -90 || lat > 90) {
      return NextResponse.json({
        lat,
        lon,
        fetchedAt: new Date().toISOString(),
        current: { tempC: 0, windKph: 0, windDirDeg: 0 },
        error: 'Invalid latitude: must be between -90 and 90',
      });
    }

    if (lon < -180 || lon > 180) {
      return NextResponse.json({
        lat,
        lon,
        fetchedAt: new Date().toISOString(),
        current: { tempC: 0, windKph: 0, windDirDeg: 0 },
        error: 'Invalid longitude: must be between -180 and 180',
      });
    }

    // Check cache
    const cacheKey = getCacheKey(lat, lon);
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    // Fetch fresh data
    const weatherData = await fetchWeather(lat, lon);

    // Update cache only if no error
    if (!weatherData.error) {
      cache.set(cacheKey, {
        ts: Date.now(),
        data: weatherData,
      });

      // Clean old cache entries
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (now - entry.ts > CACHE_TTL_MS) {
          cache.delete(key);
        }
      }
    }

    return NextResponse.json(weatherData);
  } catch (error) {
    // Never throw; return stable error response
    return NextResponse.json({
      lat: 0,
      lon: 0,
      fetchedAt: new Date().toISOString(),
      current: { tempC: 0, windKph: 0, windDirDeg: 0 },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

