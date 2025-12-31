/**
 * Core data types for WindBorne balloon tracking
 */

/**
 * A single balloon position point
 */
export interface BalloonPoint {
  lat: number;
  lon: number;
  altKm: number;
}

/**
 * A snapshot of balloon positions at a specific time
 */
export interface Snapshot {
  balloons: BalloonPoint[];
  tHoursAgo: number; // 0 = now, 1 = 1h ago, etc.
}

/**
 * API response metadata
 */
export interface BalloonsApiMeta {
  requestedHours: number;
  recoveredHours: number;
  totalPoints: number;
}

/**
 * Complete API response from /api/balloons
 */
export interface BalloonsApiResponse {
  snapshots: Snapshot[];
  meta: BalloonsApiMeta;
  error?: string;
}

