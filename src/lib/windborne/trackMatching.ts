import { haversine } from '../geo/haversine';
import type { Snapshot, Track, TrackPoint, BalloonPoint } from '../types';

/**
 * Cost function for matching balloons between snapshots
 * 
 * @param p1 - First balloon point
 * @param p2 - Second balloon point
 * @returns Match cost (lower is better)
 * 
 * @remarks
 * Cost = horizontal_distance_km + 5 * abs(altitude_difference_km)
 * This weights altitude changes more heavily since balloons typically
 * stay at similar altitudes.
 */
function matchCost(p1: BalloonPoint, p2: BalloonPoint): number {
  const horizontalKm = haversine(p1.lat, p1.lon, p2.lat, p2.lon);
  const altDiffKm = Math.abs(p2.altKm - p1.altKm);
  return horizontalKm + 5 * altDiffKm;
}

/**
 * Match balloons between two consecutive snapshots using greedy algorithm
 * 
 * @param older - Older snapshot balloons
 * @param newer - Newer snapshot balloons
 * @param threshold - Maximum cost for a valid match (default 100 km)
 * @returns Array of matched pairs [olderIndex, newerIndex]
 */
function matchSnapshots(
  older: BalloonPoint[],
  newer: BalloonPoint[],
  threshold: number = 100
): Array<[number, number]> {
  const matches: Array<[number, number]> = [];
  const usedNewer = new Set<number>();

  // For each balloon in older snapshot
  for (let i = 0; i < older.length; i++) {
    let bestMatch: number | null = null;
    let bestCost = threshold;

    // Find best match in newer snapshot
    for (let j = 0; j < newer.length; j++) {
      if (usedNewer.has(j)) continue;

      const cost = matchCost(older[i], newer[j]);
      if (cost < bestCost) {
        bestCost = cost;
        bestMatch = j;
      }
    }

    // If good match found, record it
    if (bestMatch !== null) {
      matches.push([i, bestMatch]);
      usedNewer.add(bestMatch);
    }
  }

  return matches;
}

/**
 * Build balloon tracks from snapshots using best-effort matching
 * 
 * @param snapshots - Array of snapshots sorted by tHoursAgo (ascending)
 * @returns Array of tracks with at least 3 points
 * 
 * @remarks
 * Algorithm:
 * 1. Sort snapshots from oldest to newest (highest tHoursAgo to lowest)
 * 2. Start with oldest snapshot - each balloon begins a potential track
 * 3. For each subsequent snapshot, greedily match balloons to existing tracks
 * 4. Use cost function: horizontal_km + 5 * abs(altDiffKm)
 * 5. Skip empty snapshots
 * 6. Return only tracks with >= 3 points
 * 
 * @example
 * ```ts
 * const tracks = matchTracks(snapshots);
 * // Returns tracks like:
 * // [
 * //   { id: "track-0", points: [{tHoursAgo: 23, point: {...}}, ...] },
 * //   { id: "track-1", points: [{tHoursAgo: 22, point: {...}}, ...] }
 * // ]
 * ```
 */
export function matchTracks(snapshots: Snapshot[]): Track[] {
  if (snapshots.length === 0) return [];

  // Sort snapshots from oldest to newest (descending tHoursAgo)
  const sorted = [...snapshots]
    .filter((s) => s.balloons.length > 0)
    .sort((a, b) => b.tHoursAgo - a.tHoursAgo);

  if (sorted.length === 0) return [];

  // Initialize tracks with oldest snapshot
  const oldest = sorted[0];
  let nextTrackId = 0;
  
  const activeTracks: Array<{
    id: string;
    points: TrackPoint[];
    lastIndex: number;
  }> = oldest.balloons.map((balloon) => ({
    id: `track-${nextTrackId++}`,
    points: [
      {
        tHoursAgo: oldest.tHoursAgo,
        point: balloon,
      },
    ],
    lastIndex: 0,
  }));

  // Match each subsequent snapshot
  for (let i = 1; i < sorted.length; i++) {
    const currentSnapshot = sorted[i];
    const previousBalloons = activeTracks.map(
      (t) => t.points[t.points.length - 1].point
    );

    // Find matches between previous and current
    const matches = matchSnapshots(previousBalloons, currentSnapshot.balloons);

    // Extend matched tracks
    const extendedTracks = new Set<number>();
    for (const [prevIdx, currIdx] of matches) {
      activeTracks[prevIdx].points.push({
        tHoursAgo: currentSnapshot.tHoursAgo,
        point: currentSnapshot.balloons[currIdx],
      });
      extendedTracks.add(currIdx);
    }

    // Start new tracks for unmatched balloons
    for (let j = 0; j < currentSnapshot.balloons.length; j++) {
      if (!extendedTracks.has(j)) {
        activeTracks.push({
          id: `track-${nextTrackId++}`,
          points: [
            {
              tHoursAgo: currentSnapshot.tHoursAgo,
              point: currentSnapshot.balloons[j],
            },
          ],
          lastIndex: j,
        });
      }
    }
  }

  // Filter tracks with at least 3 points and convert to output format
  return activeTracks
    .filter((track) => track.points.length >= 3)
    .map((track) => ({
      id: track.id,
      points: track.points,
    }));
}

