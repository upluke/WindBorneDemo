import type { BalloonPoint } from '../types';

/**
 * Parse WindBorne treasure snapshot from raw text.
 * Expected format: [[lat, lon, altKm], ...]
 * 
 * Strategy:
 * 1. Try strict JSON.parse for clean data
 * 2. On failure, use regex to salvage [num,num,num] triples from corrupted JSON
 * 
 * @param text - Raw response text from WindBorne API
 * @returns Array of valid balloon points, or empty array if parsing fails
 * 
 * @remarks
 * Filters invalid ranges:
 * - lat ∈ [-90, 90]
 * - lon ∈ [-180, 180]
 * - altKm ∈ [0, 60]
 */
export function parseSnapshot(text: string): BalloonPoint[] {
  // 1) Strict JSON parse
  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      const balloons: BalloonPoint[] = [];
      for (const row of parsed) {
        if (Array.isArray(row) && row.length === 3) {
          const lat = Number(row[0]);
          const lon = Number(row[1]);
          const altKm = Number(row[2]);
          
          // Validate ranges
          if (
            Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
            Number.isFinite(lon) && lon >= -180 && lon <= 180 &&
            Number.isFinite(altKm) && altKm >= 0 && altKm <= 60
          ) {
            balloons.push({ lat, lon, altKm });
          }
        }
      }
      return balloons;
    }

    return [];
  } catch {
    // 2) Salvage fallback: extract [num,num,num] triples anywhere in text
    const NUM = "[-+]?(?:\\d+\\.\\d+|\\d+)(?:[eE][-+]?\\d+)?";
    const re = new RegExp(`\\[\\s*(${NUM})\\s*,\\s*(${NUM})\\s*,\\s*(${NUM})\\s*\\]`, "g");

    const balloons: BalloonPoint[] = [];
    let m: RegExpExecArray | null;
    
    while ((m = re.exec(text)) !== null) {
      const lat = Number(m[1]);
      const lon = Number(m[2]);
      const altKm = Number(m[3]);
      
      // Validate ranges
      if (
        Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
        Number.isFinite(lon) && lon >= -180 && lon <= 180 &&
        Number.isFinite(altKm) && altKm >= 0 && altKm <= 60
      ) {
        balloons.push({ lat, lon, altKm });
      }
    }

    return balloons;
  }
}

