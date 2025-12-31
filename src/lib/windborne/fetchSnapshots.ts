import type { Snapshot } from '../types';
import { parseSnapshot } from './parseSnapshot';

const WINDBORNE_TREASURE_BASE = "https://a.windbornesystems.com/treasure";
const FETCH_TIMEOUT_MS = 8000; // 8 seconds

/**
 * Fetch a single snapshot from WindBorne treasure API
 * 
 * @param tHoursAgo - Time offset (0 = now, 1 = 1h ago, etc.)
 * @returns Snapshot if successful, null if failed or invalid
 * 
 * @remarks
 * Uses 8-second timeout via AbortController to prevent hanging requests.
 * All network and parsing errors are caught and return null.
 */
async function fetchSingleSnapshot(tHoursAgo: number): Promise<Snapshot | null> {
  const paddedHour = tHoursAgo.toString().padStart(2, "0");
  const url = `${WINDBORNE_TREASURE_BASE}/${paddedHour}.json`;

  // Create abort controller with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const text = await response.text();
    const balloons = parseSnapshot(text);

    if (balloons.length === 0) {
      return null;
    }

    return {
      balloons,
      tHoursAgo,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Timeout fetching hour ${paddedHour}`);
    } else {
      console.error(`Failed to fetch hour ${paddedHour}:`, error);
    }
    
    return null;
  }
}

/**
 * Fetch multiple snapshots from WindBorne treasure API
 * 
 * @param hours - Number of hours to fetch (1-24)
 * @returns Array of successfully fetched snapshots (may be shorter than requested)
 * 
 * @remarks
 * Uses Promise.allSettled to attempt all fetches in parallel.
 * Failed requests are silently skipped - the API remains stable even if some hours fail.
 * Each request has an 8-second timeout.
 * 
 * @example
 * ```ts
 * const snapshots = await fetchSnapshots(24);
 * // Returns all available snapshots from 00.json through 23.json
 * ```
 */
export async function fetchSnapshots(hours: number): Promise<Snapshot[]> {
  // Defensive: clamp hours to valid range
  const safeHours = Math.min(Math.max(1, Math.floor(hours)), 24);
  
  const hourIndices = Array.from({ length: safeHours }, (_, i) => i);
  
  // Fetch all in parallel with Promise.allSettled for resilience
  const results = await Promise.allSettled(
    hourIndices.map((h) => fetchSingleSnapshot(h))
  );

  // Extract successful snapshots
  const snapshots: Snapshot[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value !== null) {
      snapshots.push(result.value);
    }
  }

  return snapshots;
}

