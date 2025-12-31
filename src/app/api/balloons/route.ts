import { NextRequest, NextResponse } from 'next/server';
import type { Snapshot, BalloonsApiResponse } from '@/lib/types';
import { fetchSnapshots } from '@/lib/windborne/fetchSnapshots';

// Simple in-memory cache with TTL
interface CacheEntry {
  ts: number;
  data: Snapshot[];
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Main API handler
 */
export async function GET(request: NextRequest): Promise<NextResponse<BalloonsApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const hoursParam = searchParams.get('hours');
    const hours = hoursParam ? Math.min(Math.max(1, parseInt(hoursParam, 10)), 24) : 24;
    
    const cacheKey = `balloons_${hours}`;
    
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      const totalPoints = cached.data.reduce((sum, snap) => sum + snap.balloons.length, 0);
      // Guarantee stable ordering
      const sortedSnapshots = [...cached.data].sort((a, b) => a.tHoursAgo - b.tHoursAgo);
      return NextResponse.json({
        snapshots: sortedSnapshots,
        meta: {
          requestedHours: hours,
          recoveredHours: cached.data.length,
          totalPoints,
        },
      });
    }
    
    // Fetch snapshots
    const snapshots = await fetchSnapshots(hours);
    
    // Guarantee stable ordering
    snapshots.sort((a, b) => a.tHoursAgo - b.tHoursAgo);
    
    // Update cache
    cache.set(cacheKey, {
      ts: Date.now(),
      data: snapshots,
    });
    
    // Clean old cache entries (simple sweep)
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now - entry.ts > CACHE_TTL_MS) {
        cache.delete(key);
      }
    }
    
    const totalPoints = snapshots.reduce((sum, snap) => sum + snap.balloons.length, 0);
    
    return NextResponse.json({
      snapshots,
      meta: {
        requestedHours: hours,
        recoveredHours: snapshots.length,
        totalPoints,
      },
    });
  } catch (error) {
    // Never throw; return stable response
    return NextResponse.json({
      snapshots: [],
      meta: {
        requestedHours: 0,
        recoveredHours: 0,
        totalPoints: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

